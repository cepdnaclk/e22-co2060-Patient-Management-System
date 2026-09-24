package com.pms.backend.auth.service;

import com.pms.backend.auth.entity.EmailOtp;
import com.pms.backend.auth.repository.EmailOtpRepository;
import com.pms.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Generates and verifies 6-digit OTPs for email verification during signup.
 * OTPs are BCrypt-hashed before storage and rate-limited to prevent abuse.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    /** Max OTP requests allowed per email in 15 minutes */
    private static final int MAX_OTP_REQUESTS_PER_WINDOW = 5;
    private static final int RATE_LIMIT_WINDOW_MINUTES = 15;

    /**
     * Generate a 6-digit OTP, hash it, save it, and email it to the user.
     */
    @Transactional
    public void generateAndSendOtp(String email, String firstName) {
        // Rate limit: max N OTP requests per email in the last 15 minutes
        long recentCount = otpRepository.countByEmailAndCreatedAtAfter(
                email, LocalDateTime.now().minusMinutes(RATE_LIMIT_WINDOW_MINUTES));
        if (recentCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
            throw new AppException(
                    "Too many OTP requests. Please wait before trying again.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        String otp = generateOtp();
        String hashedOtp = passwordEncoder.encode(otp);

        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otpHash(hashedOtp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        otpRepository.save(emailOtp);

        // Send email asynchronously — doesn't block the API response
        emailService.sendOtpEmail(email, otp, firstName);

        log.info("OTP generated and queued for email: {}", email);
    }

    /**
     * Verify the OTP entered by the user.
     * Returns true if valid; throws AppException otherwise.
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        EmailOtp emailOtp = otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new AppException(
                        "No pending verification found. Please request a new OTP.",
                        HttpStatus.BAD_REQUEST));

        // Check if already used too many attempts
        if (emailOtp.hasExceededMaxAttempts()) {
            throw new AppException(
                    "Too many incorrect attempts. Please request a new OTP.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // Check expiry
        if (emailOtp.isExpired()) {
            throw new AppException(
                    "OTP has expired. Please request a new one.",
                    HttpStatus.BAD_REQUEST);
        }

        // Increment attempt count
        emailOtp.incrementAttempts();

        // Verify the OTP against the stored hash
        if (!passwordEncoder.matches(otp, emailOtp.getOtpHash())) {
            otpRepository.save(emailOtp);
            int remaining = 5 - emailOtp.getAttempts();
            throw new AppException(
                    "Invalid OTP. " + remaining + " attempt(s) remaining.",
                    HttpStatus.BAD_REQUEST);
        }

        // Mark as verified
        emailOtp.setVerified(true);
        otpRepository.save(emailOtp);

        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    /**
     * Generate a cryptographically secure 6-digit OTP.
     */
    private String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000); // ensures 6 digits
        return String.valueOf(otp);
    }
}

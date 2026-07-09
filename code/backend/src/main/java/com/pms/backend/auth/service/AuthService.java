package com.pms.backend.auth.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.auth.dto.AuthResponse;
import com.pms.backend.auth.dto.LoginRequest;
import com.pms.backend.auth.dto.SignupRequest;
import com.pms.backend.auth.entity.RefreshToken;
import com.pms.backend.auth.repository.RefreshTokenRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.patient.service.PatientService;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository          userRepo;
    private final PasswordEncoder         passwordEncoder;
    private final JwtUtil                 jwtUtil;
    private final RefreshTokenRepository  refreshTokenRepo;
    private final AuditLogService         auditLogService;
    private final PatientService          patientService;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${app.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    // ── SIGNUP ──────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse signup(SignupRequest req, String ipAddress) {

        if (userRepo.existsByEmail(req.getEmail())) {
            throw AppException.conflict("This email is already registered");
        }
        if (userRepo.existsByMobileNumber(req.getMobileNumber())) {
            throw AppException.conflict("This mobile number is already registered");
        }

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .mobileNumber(req.getMobileNumber())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.PATIENT)
                .isActive(false)
                .build();

        User saved = userRepo.save(user);

        String accessToken  = jwtUtil.generateToken(saved);
        String refreshToken = createRefreshToken(saved);

        auditLogService.log(saved.getId(), saved.getEmail(),
                "SIGNUP", "User", saved.getId().toString(),
                "New patient account created", ipAddress);

        return new AuthResponse(accessToken, refreshToken, UserDto.from(saved));
    }

    // ── LOGIN ───────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest req, String ipAddress) {

        // 1. Find user — use same error message whether email exists or not
        //    (prevents user enumeration attacks)
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> {
                    auditLogService.logFailure(null, req.getEmail(),
                            "LOGIN_FAILED", "Invalid email", ipAddress);
                    return AppException.unauthorized("Invalid email or password");
                });

        // 2. Check account lockout
        if (user.isCurrentlyLocked()) {
            auditLogService.logFailure(user.getId(), user.getEmail(),
                    "LOGIN_BLOCKED", "Account is temporarily locked", ipAddress);
            throw AppException.unauthorized(
                "Account is temporarily locked. Try again after " +
                lockoutDurationMinutes + " minutes.");
        }

        // 3. Check account active
        if (!user.isActive()) {
            auditLogService.logFailure(user.getId(), user.getEmail(),
                    "LOGIN_FAILED", "Account deactivated", ipAddress);
            if (user.getRole() == Role.PATIENT) {
                throw AppException.unauthorized("Account pending management approval. Please wait for activation.");
            }
            throw AppException.unauthorized("Account deactivated. Contact admin.");
        }

        // 4. Verify password
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user, ipAddress);
            throw AppException.unauthorized("Invalid email or password");
        }

        // 5. Successful login — reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        String accessToken  = jwtUtil.generateToken(user);
        String refreshToken = createRefreshToken(user);

        auditLogService.log(user.getId(), user.getEmail(),
                "LOGIN", "User", user.getId().toString(),
                "Successful login", ipAddress);

        return new AuthResponse(accessToken, refreshToken, UserDto.from(user));
    }

    // ── REFRESH TOKEN ───────────────────────────────────────────────────────
    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenStr, String ipAddress) {

        RefreshToken stored = refreshTokenRepo.findByToken(refreshTokenStr)
                .orElseThrow(() -> AppException.unauthorized("Invalid refresh token"));

        if (!stored.isValid()) {
            // Token is expired or revoked — log possible token theft
            auditLogService.logFailure(stored.getUser().getId(), stored.getUser().getEmail(),
                    "REFRESH_TOKEN_INVALID", "Expired or revoked token used", ipAddress);
            throw AppException.unauthorized("Refresh token expired. Please login again.");
        }

        User user = stored.getUser();

        // Token rotation: revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepo.save(stored);

        String newAccessToken  = jwtUtil.generateToken(user);
        String newRefreshToken = createRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken, UserDto.from(user));
    }

    // ── LOGOUT ──────────────────────────────────────────────────────────────
    @Transactional
    public void logout(String refreshTokenStr, String ipAddress) {
        refreshTokenRepo.findByToken(refreshTokenStr).ifPresent(rt -> {
            refreshTokenRepo.revokeAllByUser(rt.getUser());
            auditLogService.log(rt.getUser().getId(), rt.getUser().getEmail(),
                    "LOGOUT", "User", rt.getUser().getId().toString(),
                    "All tokens revoked", ipAddress);
        });
    }

    // ── PENDING SIGNUP APPROVAL ────────────────────────────────────────────

    public List<UserDto> getPendingSignups() {
        List<User> pending = userRepo.findByRoleAndIsActive(Role.PATIENT, false);
        return pending.stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDto approveSignup(Long userId, String ipAddress) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.PATIENT) {
            throw new AppException("Only patient signups can be approved", HttpStatus.BAD_REQUEST);
        }
        if (user.isActive()) {
            throw new AppException("Signup already approved", HttpStatus.CONFLICT);
        }

        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        PatientDto patient = patientService.createPatientFromUser(user);

        auditLogService.log(user.getId(), user.getEmail(),
                "SIGNUP_APPROVED", "User", user.getId().toString(),
                "Patient signup approved — patient profile created with ID " + patient.getPatientId(), ipAddress);

        return patient;
    }

    @Transactional
    public void rejectSignup(Long userId, String ipAddress) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.PATIENT) {
            throw new AppException("Only patient signups can be rejected", HttpStatus.BAD_REQUEST);
        }
        if (user.isActive()) {
            throw new AppException("Cannot reject an already approved signup", HttpStatus.CONFLICT);
        }

        userRepo.delete(user);

        auditLogService.log(user.getId(), user.getEmail(),
                "SIGNUP_REJECTED", "User", user.getId().toString(),
                "Patient signup rejected and user deleted", ipAddress);
    }

    // ── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private String createRefreshToken(User user) {
        String tokenStr = jwtUtil.generateRefreshTokenString();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();
        refreshTokenRepo.save(rt);
        return tokenStr;
    }

    private void handleFailedLogin(User user, String ipAddress) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        user.setUpdatedAt(LocalDateTime.now());

        if (attempts >= maxFailedAttempts) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            auditLogService.logFailure(user.getId(), user.getEmail(),
                    "ACCOUNT_LOCKED",
                    "Locked after " + attempts + " failed attempts", ipAddress);
        } else {
            auditLogService.logFailure(user.getId(), user.getEmail(),
                    "LOGIN_FAILED",
                    "Wrong password. Attempt " + attempts + "/" + maxFailedAttempts, ipAddress);
        }
        userRepo.save(user);
    }
}

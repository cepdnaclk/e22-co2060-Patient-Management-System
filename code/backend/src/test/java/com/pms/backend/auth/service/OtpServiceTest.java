package com.pms.backend.auth.service;

import com.pms.backend.auth.entity.EmailOtp;
import com.pms.backend.auth.repository.EmailOtpRepository;
import com.pms.backend.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OtpService Unit Tests")
class OtpServiceTest {

    @Mock
    private EmailOtpRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(otpService, "otpExpirationMinutes", 5);
    }

    @Nested
    @DisplayName("generateAndSendOtp()")
    class GenerateAndSendOtpTests {

        @Test
        @DisplayName("Happy path: hashes generated OTP, persists entity, and triggers email")
        void generateAndSendOtp_Success() {
            when(otpRepository.countByEmailAndCreatedAtAfter(eq("user@hospital.org"), any(LocalDateTime.class)))
                    .thenReturn(0L);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedOtp123");

            otpService.generateAndSendOtp("user@hospital.org", "Alice");

            ArgumentCaptor<EmailOtp> captor = ArgumentCaptor.forClass(EmailOtp.class);
            verify(otpRepository).save(captor.capture());
            EmailOtp saved = captor.getValue();

            assertThat(saved.getEmail()).isEqualTo("user@hospital.org");
            assertThat(saved.getOtpHash()).isEqualTo("hashedOtp123");
            assertThat(saved.isVerified()).isFalse();
            assertThat(saved.getExpiresAt()).isAfter(LocalDateTime.now());

            verify(emailService).sendOtpEmail(eq("user@hospital.org"), anyString(), eq("Alice"));
        }

        @Test
        @DisplayName("Fails with 429 TOO_MANY_REQUESTS when recent requests reach 5 in window")
        void generateAndSendOtp_RateLimitExceeded() {
            when(otpRepository.countByEmailAndCreatedAtAfter(eq("user@hospital.org"), any(LocalDateTime.class)))
                    .thenReturn(5L);

            assertThatThrownBy(() -> otpService.generateAndSendOtp("user@hospital.org", "Alice"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                        assertThat(appEx.getMessage()).contains("Too many OTP requests");
                    });

            verify(otpRepository, never()).save(any());
            verify(emailService, never()).sendOtpEmail(any(), any(), any());
        }
    }

    @Nested
    @DisplayName("verifyOtp()")
    class VerifyOtpTests {

        private EmailOtp validOtp;

        @BeforeEach
        void initOtp() {
            validOtp = EmailOtp.builder()
                    .id(1L)
                    .email("user@hospital.org")
                    .otpHash("storedHashedOtp")
                    .expiresAt(LocalDateTime.now().plusMinutes(5))
                    .attempts(0)
                    .verified(false)
                    .build();
        }

        @Test
        @DisplayName("Happy path: valid OTP matches hash, marks verified=true, returns true")
        void verifyOtp_Success() {
            when(otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc("user@hospital.org"))
                    .thenReturn(Optional.of(validOtp));
            when(passwordEncoder.matches("123456", "storedHashedOtp")).thenReturn(true);

            boolean result = otpService.verifyOtp("user@hospital.org", "123456");

            assertThat(result).isTrue();
            assertThat(validOtp.isVerified()).isTrue();
            assertThat(validOtp.getAttempts()).isEqualTo(1);
            verify(otpRepository).save(validOtp);
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when no pending OTP exists")
        void verifyOtp_NoPendingOtp() {
            when(otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc("user@hospital.org"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> otpService.verifyOtp("user@hospital.org", "123456"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).contains("No pending verification found");
                    });
        }

        @Test
        @DisplayName("Fails with 429 TOO_MANY_REQUESTS when max attempts (5) exceeded")
        void verifyOtp_MaxAttemptsExceeded() {
            validOtp.setAttempts(5);
            when(otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc("user@hospital.org"))
                    .thenReturn(Optional.of(validOtp));

            assertThatThrownBy(() -> otpService.verifyOtp("user@hospital.org", "123456"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                        assertThat(appEx.getMessage()).contains("Too many incorrect attempts");
                    });

            verify(passwordEncoder, never()).matches(any(), any());
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when OTP is expired")
        void verifyOtp_ExpiredOtp() {
            validOtp.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // expired
            when(otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc("user@hospital.org"))
                    .thenReturn(Optional.of(validOtp));

            assertThatThrownBy(() -> otpService.verifyOtp("user@hospital.org", "123456"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).contains("OTP has expired");
                    });

            verify(passwordEncoder, never()).matches(any(), any());
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST on wrong OTP, increments attempts and reports remaining")
        void verifyOtp_WrongOtp_IncrementsAttempts() {
            when(otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc("user@hospital.org"))
                    .thenReturn(Optional.of(validOtp));
            when(passwordEncoder.matches("wrongOtp", "storedHashedOtp")).thenReturn(false);

            assertThatThrownBy(() -> otpService.verifyOtp("user@hospital.org", "wrongOtp"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).contains("Invalid OTP. 4 attempt(s) remaining.");
                    });

            assertThat(validOtp.getAttempts()).isEqualTo(1);
            assertThat(validOtp.isVerified()).isFalse();
            verify(otpRepository).save(validOtp);
        }
    }
}

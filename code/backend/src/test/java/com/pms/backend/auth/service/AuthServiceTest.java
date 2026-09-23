package com.pms.backend.auth.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.auth.dto.AuthResponse;
import com.pms.backend.auth.dto.LoginRequest;
import com.pms.backend.auth.entity.RefreshToken;
import com.pms.backend.auth.repository.RefreshTokenRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.service.PatientService;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RefreshTokenRepository refreshTokenRepo;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private PatientService patientService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockoutDurationMinutes", 15);
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
    }

    @Test
    void testLogin_UserNotFound_ThrowsException() {
        // Arrange
        String email = "nonexistent@test.com";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("password123");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(req, "127.0.0.1");
        });
        assertEquals("Invalid email or password", exception.getMessage());
        verify(auditLogService, times(1)).logFailure(isNull(), eq(email), eq("LOGIN_FAILED"), anyString(), eq("127.0.0.1"));
    }

    @Test
    void testLogin_AccountDeactivated_Patient_ThrowsPendingApprovalMessage() {
        // Arrange
        String email = "patient.pending@test.com";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("password123");

        User user = User.builder()
                .id(2L)
                .email(email)
                .role(Role.PATIENT)
                .isActive(false)
                .failedLoginAttempts(0)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(req, "127.0.0.1");
        });
        assertEquals("Account pending management approval. Please wait for activation.", exception.getMessage());
    }

    @Test
    void testLogin_AccountDeactivated_Staff_ThrowsDeactivatedMessage() {
        // Arrange
        String email = "nurse.deactivated@test.com";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("password123");

        User user = User.builder()
                .id(3L)
                .email(email)
                .role(Role.NURSE)
                .isActive(false)
                .failedLoginAttempts(0)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(req, "127.0.0.1");
        });
        assertEquals("Account deactivated. Contact admin.", exception.getMessage());
    }

    @Test
    void testLogin_CurrentlyLocked_ThrowsLockoutMessage() {
        // Arrange
        String email = "locked.user@test.com";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("CorrectPassword123!");

        User user = User.builder()
                .id(4L)
                .email(email)
                .role(Role.DOCTOR)
                .isActive(true)
                .failedLoginAttempts(5)
                .lockedUntil(LocalDateTime.now().plusMinutes(10))
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(req, "127.0.0.1");
        });
        assertTrue(exception.getMessage().contains("Account is temporarily locked"));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLogin_IncorrectPassword_IncrementsFailedAttemptsAndLocksOnFifth() {
        // Arrange
        String email = "doctor@test.com";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("wrongPassword");

        User user = User.builder()
                .id(5L)
                .email(email)
                .passwordHash("hashedPass")
                .role(Role.DOCTOR)
                .isActive(true)
                .failedLoginAttempts(4) // 4 attempts already
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPass")).thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(req, "127.0.0.1");
        });
        assertEquals("Invalid email or password", exception.getMessage());
        assertEquals(5, user.getFailedLoginAttempts());
        assertNotNull(user.getLockedUntil());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testLogin_SuccessfulLogin_ResetsFailedAttemptsAndReturnsTokens() {
        // Arrange
        String email = "admin@pms.local";
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("ValidPassword123!");

        User user = User.builder()
                .id(1L)
                .email(email)
                .passwordHash("hashedPass")
                .role(Role.SUPER_ADMIN)
                .isActive(true)
                .failedLoginAttempts(3)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("ValidPassword123!", "hashedPass")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("mock-access-token");
        when(jwtUtil.generateRefreshTokenString()).thenReturn("mock-refresh-token");

        // Act
        AuthResponse response = authService.login(req, "127.0.0.1");

        // Assert
        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
        verify(userRepository, times(1)).save(user);
        verify(refreshTokenRepo, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void testRefreshAccessToken_Success_RotatesTokens() {
        // Arrange
        String oldRefreshTokenStr = "old-refresh-token";
        User user = User.builder()
                .id(10L)
                .email("user@test.com")
                .role(Role.PATIENT)
                .isActive(true)
                .build();

        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .token(oldRefreshTokenStr)
                .user(user)
                .revoked(false)
                .expiresAt(LocalDateTime.now().plusDays(5))
                .build();

        when(refreshTokenRepo.findByToken(oldRefreshTokenStr)).thenReturn(Optional.of(storedToken));
        when(jwtUtil.generateToken(user)).thenReturn("new-access-token");
        when(jwtUtil.generateRefreshTokenString()).thenReturn("new-refresh-token");

        // Act
        AuthResponse response = authService.refreshAccessToken(oldRefreshTokenStr, "127.0.0.1");

        // Assert
        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
        assertTrue(storedToken.isRevoked(), "Old refresh token must be revoked (rotated)");
        verify(refreshTokenRepo, atLeastOnce()).save(storedToken);
    }

    @Test
    void testRefreshAccessToken_RevokedTokenReplay_ThrowsUnauthorized() {
        // Arrange
        String replayTokenStr = "replayed-revoked-token";
        User user = User.builder()
                .id(10L)
                .email("user@test.com")
                .role(Role.PATIENT)
                .isActive(true)
                .build();

        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .token(replayTokenStr)
                .user(user)
                .revoked(true) // already revoked
                .expiresAt(LocalDateTime.now().plusDays(5))
                .build();

        when(refreshTokenRepo.findByToken(replayTokenStr)).thenReturn(Optional.of(storedToken));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.refreshAccessToken(replayTokenStr, "127.0.0.1");
        });
        assertEquals("Refresh token expired. Please login again.", exception.getMessage());
        verify(auditLogService, times(1)).logFailure(eq(10L), eq("user@test.com"), eq("REFRESH_TOKEN_INVALID"), anyString(), eq("127.0.0.1"));
    }

    @Test
    void testLogout_RevokesAllTokensForUser() {
        // Arrange
        String tokenStr = "user-active-refresh-token";
        User user = User.builder()
                .id(10L)
                .email("user@test.com")
                .role(Role.PATIENT)
                .build();

        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .token(tokenStr)
                .user(user)
                .build();

        when(refreshTokenRepo.findByToken(tokenStr)).thenReturn(Optional.of(storedToken));

        // Act
        authService.logout(tokenStr, "127.0.0.1");

        // Assert
        verify(refreshTokenRepo, times(1)).revokeAllByUser(user);
        verify(auditLogService, times(1)).log(eq(10L), eq("user@test.com"), eq("LOGOUT"), eq("User"), eq("10"), anyString(), eq("127.0.0.1"));
    }
}

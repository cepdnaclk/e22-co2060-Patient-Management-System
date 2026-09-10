package com.pms.backend.auth.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    // Inject the mocks into the AuthService
    @InjectMocks
    private AuthService authService;

    @Test
    void testLogin_UserNotFound_ThrowsException() {
        // Arrange
        String email = "nonexistent@test.com";
        String password = "password123";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(email, password);
        });
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void testLogin_IncorrectPassword_ThrowsException() {
        // Arrange
        String email = "test@hospital.com";
        String password = "12345678";
        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPasswordHash("hashedpassword");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(password, "hashedpassword")).thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authService.login(email, password);
        });
        assertEquals("Invalid email or password", exception.getMessage());
    }
}

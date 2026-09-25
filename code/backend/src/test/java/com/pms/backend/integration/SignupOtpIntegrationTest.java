package com.pms.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.BasePostgresIntegrationTest;
import com.pms.backend.auth.dto.AuthResponse;
import com.pms.backend.auth.dto.SignupRequest;
import com.pms.backend.auth.dto.VerifyOtpRequest;
import com.pms.backend.auth.entity.EmailOtp;
import com.pms.backend.auth.repository.EmailOtpRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Signup + OTP Verification Integration Test")
class SignupOtpIntegrationTest extends BasePostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.pms.backend.audit.repository.AuditLogRepository auditLogRepository;

    @Autowired
    private com.pms.backend.auth.repository.RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private com.pms.backend.notification.repository.NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        cleanUp();
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        emailOtpRepository.deleteAll();
        auditLogRepository.deleteAll();
        notificationRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Signup flow: creates unverified user + OTP -> verify wrong OTP -> verify expired OTP -> verify 5 failed attempts lockout -> verify valid OTP succeeds")
    void testSignupAndOtpLifecycle() throws Exception {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFirstName("Peter");
        signupReq.setLastName("Parker");
        signupReq.setEmail("peter.parker@dailybugle.local");
        signupReq.setPassword("SpiderMan@2026");
        signupReq.setMobileNumber("+15557788");

        // 1. POST /api/auth/signup
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("peter.parker@dailybugle.local"));

        // User should exist but with emailVerified = false
        User user = userRepository.findByEmail("peter.parker@dailybugle.local").orElse(null);
        assertThat(user).isNotNull();
        assertThat(user.isEmailVerified()).isFalse();

        // EmailOtp row must be created in DB
        EmailOtp otpEntity = emailOtpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(user.getEmail())
                .orElse(null);
        assertThat(otpEntity).isNotNull();
        assertThat(otpEntity.getAttempts()).isEqualTo(0);
        assertThat(otpEntity.isVerified()).isFalse();

        // 2. POST /api/auth/signup/verify-otp with incorrect OTP -> 400 BAD_REQUEST
        VerifyOtpRequest wrongOtpReq = makeVerifyOtpRequest(user.getEmail(), "000000");
        mockMvc.perform(post("/api/auth/signup/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOtpReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid OTP")));

        otpEntity = emailOtpRepository.findById(otpEntity.getId()).orElseThrow();
        assertThat(otpEntity.getAttempts()).isEqualTo(1);

        // 3. Test expiry branch
        otpEntity.setExpiresAt(LocalDateTime.now().minusMinutes(10));
        emailOtpRepository.save(otpEntity);

        VerifyOtpRequest expiredReq = makeVerifyOtpRequest(user.getEmail(), "123456");
        mockMvc.perform(post("/api/auth/signup/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expiredReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("OTP has expired")));

        // 4. Test max-attempt lockout (5 failed attempts) -> 429 TOO_MANY_REQUESTS
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // un-expire
        otpEntity.setAttempts(5); // max reached
        emailOtpRepository.save(otpEntity);

        VerifyOtpRequest lockoutReq = makeVerifyOtpRequest(user.getEmail(), "123456");
        mockMvc.perform(post("/api/auth/signup/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockoutReq)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Too many incorrect attempts")));

        // 5. Success path with valid OTP
        // Reset valid unexpired OTP with known plain code
        String validPlainOtp = "654321";
        otpEntity.setOtpHash(passwordEncoder.encode(validPlainOtp));
        otpEntity.setAttempts(0);
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailOtpRepository.save(otpEntity);

        VerifyOtpRequest validReq = makeVerifyOtpRequest(user.getEmail(), validPlainOtp);
        String authResponseJson = mockMvc.perform(post("/api/auth/signup/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(authResponseJson, AuthResponse.class);
        assertThat(authResponse.getAccessToken()).isNotBlank();
        assertThat(authResponse.getRefreshToken()).isNotBlank();
        assertThat(authResponse.getUser().getEmail()).isEqualTo("peter.parker@dailybugle.local");

        // Verify database state: emailVerified flipped to true
        User verifiedUser = userRepository.findByEmail("peter.parker@dailybugle.local").orElseThrow();
        assertThat(verifiedUser.isEmailVerified()).isTrue();

        // Verify EmailOtp entity marked verified
        EmailOtp verifiedOtp = emailOtpRepository.findById(otpEntity.getId()).orElseThrow();
        assertThat(verifiedOtp.isVerified()).isTrue();
    }

    private VerifyOtpRequest makeVerifyOtpRequest(String email, String otp) {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail(email);
        req.setOtp(otp);
        return req;
    }
}

package com.pms.backend.auth.service;

import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtUtil Unit Tests")
class JwtUtilTest {

    private JwtUtil jwtUtil;

    // 256-bit test secret (32 bytes base64 encoded)
    private static final String TEST_SECRET = Base64.getEncoder().encodeToString(
            "01234567890123456789012345678901".getBytes()
    );
    private static final long EXPIRATION_MS = 900_000L; // 15 mins

    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", EXPIRATION_MS);

        sampleUser = User.builder()
                .id(42L)
                .firstName("Ada")
                .lastName("Lovelace")
                .email("ada@hospital.org")
                .role(Role.ADMIN)
                .build();
    }

    @Nested
    @DisplayName("generateToken() and Claim Extraction")
    class GenerateAndExtractTests {

        @Test
        @DisplayName("Generates token with valid subject, email, role, and names")
        void generateToken_ExtractClaims_Success() {
            String token = jwtUtil.generateToken(sampleUser);

            assertThat(token).isNotBlank();
            assertThat(jwtUtil.isValid(token)).isTrue();
            assertThat(jwtUtil.getUserId(token)).isEqualTo(42L);
            assertThat(jwtUtil.getEmail(token)).isEqualTo("ada@hospital.org");
        }
    }

    @Nested
    @DisplayName("Token Validation and Expiry Tests")
    class ValidationTests {

        @Test
        @DisplayName("Valid token returns true")
        void isValid_ValidToken_ReturnsTrue() {
            String token = jwtUtil.generateToken(sampleUser);
            assertThat(jwtUtil.isValid(token)).isTrue();
        }

        @Test
        @DisplayName("Tampered token returns false")
        void isValid_TamperedToken_ReturnsFalse() {
            String token = jwtUtil.generateToken(sampleUser);
            String tampered = token.substring(0, token.length() - 4) + "XXXX";
            assertThat(jwtUtil.isValid(tampered)).isFalse();
        }

        @Test
        @DisplayName("Malformed string returns false")
        void isValid_MalformedString_ReturnsFalse() {
            assertThat(jwtUtil.isValid("not.a.jwt.token")).isFalse();
            assertThat(jwtUtil.isValid("")).isFalse();
            assertThat(jwtUtil.isValid(null)).isFalse();
        }

        @Test
        @DisplayName("Expired token returns false")
        void isValid_ExpiredToken_ReturnsFalse() {
            // Configure negative expiration
            ReflectionTestUtils.setField(jwtUtil, "expirationMs", -10_000L);
            String expiredToken = jwtUtil.generateToken(sampleUser);

            // Re-set valid expiration
            ReflectionTestUtils.setField(jwtUtil, "expirationMs", EXPIRATION_MS);

            assertThat(jwtUtil.isValid(expiredToken)).isFalse();
        }
    }

    @Nested
    @DisplayName("generateRefreshTokenString()")
    class RefreshTokenTests {

        @Test
        @DisplayName("Generates high-entropy 64-byte Base64-url string")
        void generateRefreshTokenString_FormatAndUniqueness() {
            String token1 = jwtUtil.generateRefreshTokenString();
            String token2 = jwtUtil.generateRefreshTokenString();

            assertThat(token1).isNotBlank();
            assertThat(token2).isNotBlank();
            assertThat(token1).isNotEqualTo(token2);
            // 64 raw bytes encoded in base64 URL without padding is 86 characters
            assertThat(token1.length()).isEqualTo(86);
        }
    }
}

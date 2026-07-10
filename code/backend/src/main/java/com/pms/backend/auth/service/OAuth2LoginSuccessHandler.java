package com.pms.backend.auth.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.auth.entity.RefreshToken;
import com.pms.backend.auth.repository.RefreshTokenRepository;
import com.pms.backend.patient.service.PatientService;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepo;
    private final AuditLogService auditLogService;
    private final PatientService patientService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String givenName = oAuth2User.getAttribute("given_name");
        String familyName = oAuth2User.getAttribute("family_name");

        User user = userRepo.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .firstName(givenName != null ? givenName : "Google")
                    .lastName(familyName != null ? familyName : "User")
                    .email(email)
                    .mobileNumber("0000000000")
                    .passwordHash(passwordEncoder.encode("oauth2-" + UUID.randomUUID()))
                    .role(Role.PATIENT)
                    .isActive(true)
                    .build();
            User saved = userRepo.save(newUser);
            patientService.createPatientFromUser(saved);
            return saved;
        });

        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = createRefreshToken(user);

        auditLogService.log(user.getId(), user.getEmail(),
                "OAUTH2_LOGIN", "User", user.getId().toString(),
                "Google Sign-In successful", getClientIp(request));

        String userJson = String.format(
                "{\"id\":%d,\"firstName\":\"%s\",\"lastName\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name()
        );

        String url = redirectUri +
                "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8) +
                "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8) +
                "&user=" + URLEncoder.encode(userJson, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, url);
    }

    private String createRefreshToken(User user) {
        String tokenStr = jwtUtil.generateRefreshTokenString();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(604800L))
                .build();
        refreshTokenRepo.save(rt);
        return tokenStr;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

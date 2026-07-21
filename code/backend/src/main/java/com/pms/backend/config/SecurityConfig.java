package com.pms.backend.config;

import com.pms.backend.auth.service.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${FRONTEND_URL:https://e22-2yp-co2060-pms-frontend.vercel.app}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsSource()))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> 
                            response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
                        )
                )

                // ── Security Headers ───────────────────────────────────────
                .headers(headers -> headers
                    .frameOptions(frame -> frame.deny())
                    // Prevent clickjacking
                    .contentTypeOptions(ct -> {})
                    // Prevent MIME sniffing
                    .referrerPolicy(ref ->
                        ref.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000))
                    // HSTS: force HTTPS for 1 year
                )

                .authorizeHttpRequests(auth -> auth
                    // Public endpoints
                    .requestMatchers(
                        "/api/auth/signup",
                        "/api/auth/login",
                        "/api/auth/google",
                        "/api/auth/refresh"
                    ).permitAll()

                    // Admin-only endpoints
                    .requestMatchers("/api/audit/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")

                    .requestMatchers("/api/users/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN", "DOCTOR")

                    // File downloads — publicly accessible so embedded images/PDFs render
                    .requestMatchers("/api/files/**")
                        .permitAll()

                    // All other endpoints require authentication
                    .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Increased from 10 to 12 for better security
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                frontendUrl
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

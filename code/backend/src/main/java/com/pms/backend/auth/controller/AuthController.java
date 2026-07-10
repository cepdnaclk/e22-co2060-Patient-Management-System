package com.pms.backend.auth.controller;

import com.pms.backend.auth.dto.AuthResponse;
import com.pms.backend.auth.dto.GoogleAuthRequest;
import com.pms.backend.auth.dto.LoginRequest;
import com.pms.backend.auth.dto.SignupRequest;
import com.pms.backend.auth.service.AuthService;
import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.user.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.signup(request, getClientIp(httpRequest));
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, getClientIp(httpRequest));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.googleLogin(request, getClientIp(httpRequest));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AuthResponse response = authService.refreshAccessToken(refreshToken, getClientIp(httpRequest));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken, getClientIp(httpRequest));
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/signup/pending")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserDto>> getPendingSignups() {
        return ResponseEntity.ok(authService.getPendingSignups());
    }

    @PutMapping("/signup/{userId}/approve")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<PatientDto> approveSignup(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        PatientDto patient = authService.approveSignup(userId, getClientIp(httpRequest));
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/signup/{userId}/reject")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> rejectSignup(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        authService.rejectSignup(userId, getClientIp(httpRequest));
        return ResponseEntity.noContent().build();
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

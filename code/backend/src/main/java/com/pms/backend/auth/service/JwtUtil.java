package com.pms.backend.auth.service;

import com.pms.backend.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    // Access token lifetime: 15 minutes (900,000 ms) — short-lived for security
    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    // ── GENERATE ACCESS TOKEN ───────────────────────────────────────────────
    // Short-lived token (15 min). Sent in Authorization header for every API call.
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email",     user.getEmail())
                .claim("role",      user.getRole().name())
                .claim("firstName", user.getFirstName())
                .claim("lastName",  user.getLastName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // ── GENERATE REFRESH TOKEN STRING ───────────────────────────────────────
    // A cryptographically random string (NOT a JWT) stored in the database.
    // This design allows instant server-side revocation — you can't revoke a JWT
    // once issued, but you CAN delete it from your DB.
    public String generateRefreshTokenString() {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    // ── VALIDATE ACCESS TOKEN ───────────────────────────────────────────────
    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── EXTRACT DATA ────────────────────────────────────────────────────────
    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    public Long getUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    // ── PRIVATE HELPERS ─────────────────────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

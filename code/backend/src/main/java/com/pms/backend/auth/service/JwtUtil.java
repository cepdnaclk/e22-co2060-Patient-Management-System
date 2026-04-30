package com.pms.backend.auth.service;



import com.pms.backend.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
// @Component: Spring creates one instance of this class and manages it.
// Other classes can inject it with @Autowired or @RequiredArgsConstructor.
public class JwtUtil {

    @Value("${app.jwt.secret}")
    // @Value reads from application.properties: app.jwt.secret
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    // ── GENERATE TOKEN ─────────────────────────────────────────────
    // Called after successful login or signup.
    // Returns a JWT string containing userId, email, role.
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                // subject = who this token is for (user ID)
                .claim("email",     user.getEmail())
                .claim("role",      user.getRole().name())
                .claim("firstName", user.getFirstName())
                // .claim() adds custom data to the token payload
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                // signWith creates the SIGNATURE — proves it came from your server
                .compact();
        // .compact() assembles everything into the final "eyJ..." string
    }

    // ── VALIDATE TOKEN ─────────────────────────────────────────────
    // Returns true if the token is valid and not expired.
    // Called by JwtAuthFilter on every request.
    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;  // No exception = token is valid
        } catch (JwtException | IllegalArgumentException e) {
            // JwtException: expired, tampered, wrong signature
            // IllegalArgumentException: token is null or empty
            return false;
        }
    }

    // ── EXTRACT DATA FROM TOKEN ─────────────────────────────────────
    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    // ── PRIVATE HELPERS ─────────────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        // Converts Base64 secret string into a cryptographic key object
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

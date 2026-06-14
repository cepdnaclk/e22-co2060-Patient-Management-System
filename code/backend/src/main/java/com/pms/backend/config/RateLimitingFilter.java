package com.pms.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP-based rate limiting filter.
 * Uses a simple sliding-window approach in memory.
 *
 * Limits:
 *  - POST /api/auth/login   → max 5 requests per minute per IP
 *  - POST /api/auth/signup  → max 3 requests per hour per IP
 *
 * In production with multiple instances, replace with Redis-backed rate limiting.
 */
@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    @Value("${app.security.login-rate-limit-per-minute:5}")
    private int loginRateLimit;

    @Value("${app.security.signup-rate-limit-per-hour:3}")
    private int signupRateLimit;

    // Map<IP, [count, windowStartEpochMs]>
    private final Map<String, long[]> loginAttempts  = new ConcurrentHashMap<>();
    private final Map<String, long[]> signupAttempts = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest)  request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String path = req.getRequestURI();
        String ip   = getClientIp(req);

        if ("POST".equalsIgnoreCase(req.getMethod())) {
            if (path.equals("/api/auth/login")) {
                if (isRateLimited(ip, loginAttempts, loginRateLimit, 60_000L)) {
                    resp.setStatus(429);
                    resp.setContentType("application/json");
                    resp.getWriter().write(
                        "{\"message\":\"Too many login attempts. Please wait 1 minute.\"}");
                    return;
                }
            } else if (path.equals("/api/auth/signup")) {
                if (isRateLimited(ip, signupAttempts, signupRateLimit, 3_600_000L)) {
                    resp.setStatus(429);
                    resp.setContentType("application/json");
                    resp.getWriter().write(
                        "{\"message\":\"Too many registrations from this IP. Please wait 1 hour.\"}");
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Returns true if the IP has exceeded the limit within the time window.
     * Thread-safe using ConcurrentHashMap compute.
     */
    private boolean isRateLimited(String ip, Map<String, long[]> store,
                                   int limit, long windowMs) {
        long now = Instant.now().toEpochMilli();

        store.compute(ip, (key, val) -> {
            if (val == null || (now - val[1]) > windowMs) {
                // New window
                return new long[]{1, now};
            }
            val[0]++;
            return val;
        });

        long[] state = store.get(ip);
        return state != null && state[0] > limit;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

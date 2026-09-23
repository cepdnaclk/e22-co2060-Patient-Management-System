package com.pms.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitingFilter();
        ReflectionTestUtils.setField(filter, "loginRateLimit", 5);
        ReflectionTestUtils.setField(filter, "signupRateLimit", 3);
    }

    @Test
    void testLoginRateLimit_AllowsUpToFiveRequests_BlocksSixth() throws IOException, ServletException {
        String clientIp = "192.168.1.50";

        // First 5 requests should pass through
        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(req, resp, chain);
            assertEquals(200, resp.getStatus(), "Request " + i + " should pass filter");
        }

        // 6th request from the same IP should return 429
        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedReq.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResp = new MockHttpServletResponse();
        FilterChain blockedChain = new MockFilterChain();

        filter.doFilter(blockedReq, blockedResp, blockedChain);

        assertEquals(429, blockedResp.getStatus());
        assertTrue(blockedResp.getContentAsString().contains("Too many login attempts"));
    }

    @Test
    void testLoginRateLimit_DifferentIps_DoNotBlockEachOther() throws IOException, ServletException {
        // Saturate IP 1
        String ip1 = "10.0.0.1";
        for (int i = 1; i <= 6; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(ip1);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilter(req, resp, new MockFilterChain());
        }

        // IP 2 makes first request -> should succeed
        String ip2 = "10.0.0.2";
        MockHttpServletRequest reqIp2 = new MockHttpServletRequest("POST", "/api/auth/login");
        reqIp2.setRemoteAddr(ip2);
        MockHttpServletResponse respIp2 = new MockHttpServletResponse();

        filter.doFilter(reqIp2, respIp2, new MockFilterChain());
        assertEquals(200, respIp2.getStatus());
    }

    @Test
    void testSignupRateLimit_AllowsUpToThree_BlocksFourth() throws IOException, ServletException {
        String clientIp = "192.168.1.100";

        // First 3 requests pass
        for (int i = 1; i <= 3; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/signup");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilter(req, resp, new MockFilterChain());
            assertEquals(200, resp.getStatus());
        }

        // 4th request from same IP is blocked
        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/auth/signup");
        blockedReq.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResp = new MockHttpServletResponse();

        filter.doFilter(blockedReq, blockedResp, new MockFilterChain());

        assertEquals(429, blockedResp.getStatus());
        assertTrue(blockedResp.getContentAsString().contains("Too many registrations from this IP"));
    }

    @Test
    void testNonThrottledEndpoints_PassFreely() throws IOException, ServletException {
        String clientIp = "192.168.1.200";

        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/doctors");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilter(req, resp, new MockFilterChain());
            assertEquals(200, resp.getStatus());
        }
    }
}

package com.pms.backend.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Sends HTML-formatted OTP verification emails via Resend HTTP API.
 * 
 * Render's free tier blocks SMTP ports (25, 465, 587), so we use Resend's
 * REST API over HTTPS (port 443) which is always allowed.
 * 
 * Emails are sent asynchronously so the API response is not delayed.
 */
@Service
@Slf4j
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:onboarding@resend.dev}")
    private String fromEmail;

    private HttpClient httpClient;

    @PostConstruct
    public void init() {
        httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        boolean hasKey = resendApiKey != null && !resendApiKey.isBlank();
        log.info("========== EMAIL CONFIG (Resend) ==========");
        log.info("  API Key  : {}", hasKey ? "SET (" + resendApiKey.length() + " chars)" : "*** NOT SET ***");
        log.info("  From     : {}", fromEmail);
        log.info("============================================");
        if (!hasKey) {
            log.error("RESEND_API_KEY is not set! OTP emails will NOT be sent.");
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp, String firstName) {
        log.info("Dispatching OTP email to {} [OTP={}]", toEmail, otp);

        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.error("❌ Cannot send email: RESEND_API_KEY is not configured.");
            return;
        }

        try {
            String htmlContent = buildOtpEmailHtml(otp, firstName)
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "");

            String jsonBody = """
                    {
                      "from": "%s",
                      "to": ["%s"],
                      "subject": "PatientMS — Verify Your Email Address",
                      "html": "%s"
                    }
                    """.formatted(fromEmail, toEmail, htmlContent);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("✅ OTP email SENT successfully to {} | Response: {}", toEmail, response.body());
            } else {
                log.error("❌ Resend API returned HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ FAILED to send OTP email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildOtpEmailHtml(String otp, String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
                        <h1 style="color:#ffffff;font-size:24px;margin:0;letter-spacing:-0.5px;">
                            Patient<span style="color:#93c5fd;">MS</span>
                        </h1>
                        <p style="color:#bfdbfe;font-size:13px;margin:8px 0 0;">Patient Management System</p>
                    </div>
                    <!-- Body -->
                    <div style="padding:40px;">
                        <p style="color:#334155;font-size:16px;margin:0 0 8px;">
                            Hello <strong>%s</strong>,
                        </p>
                        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 28px;">
                            Thank you for signing up! Please use the verification code below to confirm your email address.
                        </p>
                        <!-- OTP Box -->
                        <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
                            <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;font-weight:600;">
                                Verification Code
                            </p>
                            <p style="color:#1e293b;font-size:36px;font-weight:800;letter-spacing:8px;margin:0;font-family:'Courier New',monospace;">
                                %s
                            </p>
                        </div>
                        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">
                            This code expires in <strong>5 minutes</strong>.
                        </p>
                        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                            If you did not create an account, please ignore this email.
                        </p>
                    </div>
                    <!-- Footer -->
                    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="color:#94a3b8;font-size:11px;margin:0;">
                            &copy; 2026 PatientMS. This is an automated message — please do not reply.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, otp);
    }
}

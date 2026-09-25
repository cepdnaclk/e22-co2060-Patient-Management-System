package com.pms.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Sends HTML-formatted OTP verification emails.
 * Emails are sent asynchronously so the API response is not delayed.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:NOT_SET}")
    private String mailHost;

    @Value("${spring.mail.port:NOT_SET}")
    private String mailPort;

    @Value("${spring.mail.username:noreply@pms.local}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void logSmtpConfig() {
        boolean hasPassword = mailPassword != null && !mailPassword.isBlank();
        log.info("========== SMTP CONFIG ==========");
        log.info("  Host     : {}", mailHost);
        log.info("  Port     : {}", mailPort);
        log.info("  Username : {}", fromEmail);
        log.info("  Password : {}", hasPassword ? "SET (" + mailPassword.length() + " chars)" : "*** EMPTY ***");
        log.info("==================================");
        if (!hasPassword) {
            log.error("MAIL_PASSWORD is empty! OTP emails will NOT be sent.");
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp, String firstName) {
        log.info("Dispatching OTP email to {} [OTP={}]", toEmail, otp);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String senderEmail = (fromEmail == null || fromEmail.isBlank()) ? "noreply@pms.local" : fromEmail;
            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("PatientMS — Verify Your Email Address");
            helper.setText(buildOtpEmailHtml(otp, firstName), true);

            mailSender.send(message);
            log.info("✅ OTP email SENT successfully to {}", toEmail);
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
                            ⏱️ This code expires in <strong>5 minutes</strong>.
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

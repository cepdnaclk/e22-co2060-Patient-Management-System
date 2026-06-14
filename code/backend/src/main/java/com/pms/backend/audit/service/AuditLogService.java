package com.pms.backend.audit.service;

import com.pms.backend.audit.entity.AuditLog;
import com.pms.backend.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Provides a simple API for logging user actions throughout the system.
 * All logging is async (@Async) so it never slows down the main request.
 *
 * Usage in other services:
 *   auditLogService.log(userId, email, "VIEW_PATIENT", "Patient", "42", ip);
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log a successful action.
     */
    @Async
    public void log(Long userId, String userEmail, String action,
                    String entityType, String entityId,
                    String details, String ipAddress) {
        try {
            AuditLog entry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .status("SUCCESS")
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception ex) {
            // Logging must NEVER crash the application
            log.error("Failed to write audit log: action={} user={}", action, userEmail, ex);
        }
    }

    /**
     * Log a failed action (e.g. login failure, access denied).
     */
    @Async
    public void logFailure(Long userId, String userEmail, String action,
                           String details, String ipAddress) {
        try {
            AuditLog entry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .status("FAILED")
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception ex) {
            log.error("Failed to write failure audit log: action={} user={}", action, userEmail, ex);
        }
    }
}

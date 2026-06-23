package com.pms.backend.audit.controller;

import com.pms.backend.audit.entity.AuditLog;
import com.pms.backend.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    /**
     * GET /api/audit/logs
     * Paginated audit log for the admin panel.
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return ResponseEntity.ok(auditLogRepository.findAll(pageable));
    }

    /**
     * GET /api/audit/logs/recent
     * Returns the 20 most recent audit log entries for the dashboard overview.
     */
    @GetMapping("/logs/recent")
    public ResponseEntity<List<AuditLog>> getRecent() {
        return ResponseEntity.ok(auditLogRepository.findTop20ByOrderByTimestampDesc());
    }

    /**
     * GET /api/audit/logs/user/{userId}
     * Returns paginated logs for a specific user.
     */
    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable));
    }
}

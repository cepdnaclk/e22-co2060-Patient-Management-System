package com.pms.backend.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Records every significant action in the system.
 * This is required for:
 *  - Healthcare compliance (who accessed what patient data and when)
 *  - Security investigation (detect suspicious access patterns)
 *  - Debugging (trace what happened before an error)
 */
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long userId;

    @Column(length = 255)
    private String userEmail;

    @Column(nullable = false, length = 100)
    private String action;
    // e.g. LOGIN, LOGOUT, LOGIN_FAILED, VIEW_PATIENT, UPDATE_RECORD, CREATE_INVOICE

    @Column(length = 100)
    private String entityType;
    // e.g. Patient, MedicalRecord, Invoice, User

    @Column(length = 100)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "SUCCESS";
    // SUCCESS or FAILED

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}

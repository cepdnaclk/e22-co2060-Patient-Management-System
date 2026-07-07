package com.pms.backend.management.entity;

import com.pms.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "management_activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagementActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The management user who performed the action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id", nullable = false)
    private User performedBy;

    // The user who was affected by the action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Column(nullable = false, length = 50)
    private String action; // CREATE_USER, UPDATE_USER, UPDATE_ROLE, DEACTIVATE_USER, etc.

    @Column(length = 500)
    private String details; // Human-readable description of what changed

    @Column(nullable = false, updatable = false)
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        performedAt = LocalDateTime.now();
    }
}

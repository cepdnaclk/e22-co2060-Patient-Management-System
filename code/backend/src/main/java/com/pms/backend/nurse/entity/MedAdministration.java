package com.pms.backend.nurse.entity;

import com.pms.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_administrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedAdministration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private MedicationOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nurse_id")
    private User nurse;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(length = 1000)
    private String notes;

    @Column(name = "administered_at", nullable = false)
    private LocalDateTime administeredAt;

    @PrePersist
    protected void onCreate() {
        if (administeredAt == null) {
            administeredAt = LocalDateTime.now();
        }
    }
}

package com.pms.backend.patient.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.pms.backend.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private LocalDate dateOfBirth;

    @Column
    private String gender;

    @Column
    private String bloodType;

    @Column
    private String bloodPressure;

    @Column
    private Integer heartRate;

    @Column
    private Double temperature;

    @Column
    private Double oxygenSaturation;

    @Column
    private Integer respiratoryRate;

    @Column
    private Double height;

    @Column
    private Double weight;

    @Column
    private LocalDateTime lastVitalsUpdate;

    @Column
    private String patientId;

    @Column
    private String primaryDoctor;

    @Column
    private LocalDateTime admissionDate;

    @Column(length = 1000)
    private String admissionReason;

    @Column
    private String admissionStatus;

    @Column
    private LocalDateTime dischargeDate;

    @Column(length = 1000)
    private String address;

    @Column
    private String emergencyContactName;

    @Column
    private String emergencyContactPhone;

    @Column
    private String emergencyContactRelation;

    @Column(length = 1000)
    private String medicalHistory;

    @Column(length = 1000)
    private String allergies;

    @Column(length = 1000)
    private String currentMedications;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean criticalStatus = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


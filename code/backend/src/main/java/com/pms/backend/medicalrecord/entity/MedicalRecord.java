package com.pms.backend.medicalrecord.entity;

import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(nullable = false)
    private String recordType; // DIAGNOSIS, PRESCRIPTION, LAB_RESULT, IMAGING, etc.

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 2000)
    private String treatment;

    @Column(length = 1000)
    private String testName;

    @Column(length = 2000)
    private String testResult;

    @Column(columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column
    @Builder.Default
    private Boolean isFulfilled = false;

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


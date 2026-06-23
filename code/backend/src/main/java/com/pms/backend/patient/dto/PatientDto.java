package com.pms.backend.patient.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDto {
    private Long id;
    private String patientId;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String bloodPressure;
    private Integer heartRate;
    private Double temperature;
    private Double oxygenSaturation;
    private Integer respiratoryRate;
    private Double height;
    private Double weight;
    private LocalDateTime lastVitalsUpdate;
    private LocalDateTime admissionDate;
    private String admissionReason;
    private String admissionStatus;
    private LocalDateTime dischargeDate;
    private String primaryDoctor;
    private String mobileNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String medicalHistory;
    private String allergies;
    private String currentMedications;
    private Boolean criticalStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


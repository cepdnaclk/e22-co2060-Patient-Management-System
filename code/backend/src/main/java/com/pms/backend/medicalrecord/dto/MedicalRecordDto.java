package com.pms.backend.medicalrecord.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String recordType;
    private String description;
    private String diagnosis;
    private String treatment;
    private String testName;
    private String testResult;
    private String attachmentUrl;
    private Boolean isFulfilled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


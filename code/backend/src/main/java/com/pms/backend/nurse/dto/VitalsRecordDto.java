package com.pms.backend.nurse.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsRecordDto {
    private Long id;
    private Long patientId;
    private Long nurseId;
    private String bloodPressure;
    private Integer heartRate;
    private Double temperature;
    private Double oxygenSaturation;
    private Integer respiratoryRate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime recordedAt;
}

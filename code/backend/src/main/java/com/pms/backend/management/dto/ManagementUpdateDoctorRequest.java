package com.pms.backend.management.dto;

import lombok.Data;

@Data
public class ManagementUpdateDoctorRequest {
    private String specialization;
    private String hospital;
    private String department;
    private Double consultationFee;
    private String bio;
    private Boolean isAvailable;
}

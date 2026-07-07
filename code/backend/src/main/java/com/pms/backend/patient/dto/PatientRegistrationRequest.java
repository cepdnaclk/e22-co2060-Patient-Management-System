package com.pms.backend.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRegistrationRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String mobileNumber;

    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String address;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
}

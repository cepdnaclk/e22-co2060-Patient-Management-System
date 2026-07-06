package com.pms.backend.auth.dto;



import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
        regexp = "^\\+?[\\d\\s\\-().]{7,20}$",
        message = "Enter a valid mobile number (e.g. +94771234567)"
    )
    private String mobileNumber;

    // INTENTIONALLY NO role FIELD.
    // Security rule: the user cannot choose their own role.
    // Role is hardcoded to PATIENT inside AuthService.
    // Even if a hacker sends { "role": "ADMIN" }, it is ignored.
}

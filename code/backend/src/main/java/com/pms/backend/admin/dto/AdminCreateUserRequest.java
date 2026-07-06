package com.pms.backend.admin.dto;

import com.pms.backend.role.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminCreateUserRequest {

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

    @NotNull(message = "Role is required")
    private Role role;
}

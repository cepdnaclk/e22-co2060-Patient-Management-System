package com.pms.backend.admin.dto;

import com.pms.backend.role.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    private String firstName;
    private String lastName;

    @Email(message = "Please enter a valid email")
    private String email;

    private String mobileNumber;
    private Role role;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private Boolean isActive;
}

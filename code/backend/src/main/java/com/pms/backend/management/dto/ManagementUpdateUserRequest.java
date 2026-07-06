package com.pms.backend.management.dto;

import com.pms.backend.role.entity.Role;
import lombok.Data;

@Data
public class ManagementUpdateUserRequest {
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private Role role;
    private Boolean isActive;
    private String password;
}

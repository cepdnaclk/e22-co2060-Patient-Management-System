package com.pms.backend.admin.dto;

import com.pms.backend.role.entity.Role;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}

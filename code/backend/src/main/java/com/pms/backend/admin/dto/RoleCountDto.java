package com.pms.backend.admin.dto;

import com.pms.backend.role.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoleCountDto {
    private Role role;
    private long count;
}

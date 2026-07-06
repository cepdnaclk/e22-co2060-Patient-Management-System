package com.pms.backend.management.controller;

import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.management.dto.ManagementUpdateDoctorRequest;
import com.pms.backend.management.dto.ManagementUpdateUserRequest;
import com.pms.backend.management.service.ManagementService;
import com.pms.backend.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/management")
@RequiredArgsConstructor
public class ManagementController {

    private final ManagementService managementService;

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody ManagementUpdateUserRequest request) {
        UserDto updatedUser = managementService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/doctors/{id}")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<DoctorDto> updateDoctor(
            @PathVariable Long id,
            @RequestBody ManagementUpdateDoctorRequest request) {
        DoctorDto updatedDoctor = managementService.updateDoctor(id, request);
        return ResponseEntity.ok(updatedDoctor);
    }
}

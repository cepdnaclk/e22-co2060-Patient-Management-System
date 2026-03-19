package com.pms.backend.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.CreateUserRequest;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        if (request.getRole() == null) {
            request.setRole(Role.PATIENT);
        }
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(201).body(created);
    }
}

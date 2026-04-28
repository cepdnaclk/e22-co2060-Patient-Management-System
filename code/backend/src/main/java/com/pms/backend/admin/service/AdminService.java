package com.pms.backend.admin.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pms.backend.admin.dto.AdminCreateUserRequest;
import com.pms.backend.admin.dto.AdminStatsDto;
import com.pms.backend.admin.dto.AdminUpdateRoleRequest;
import com.pms.backend.admin.dto.RoleCountDto;
import com.pms.backend.appointment.repository.AppointmentRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeDoctors = userRepository.countByRole(Role.DOCTOR);
        long activeNurses = userRepository.countByRole(Role.NURSE);
        long totalAppointments = appointmentRepository.count();

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .activeDoctors(activeDoctors)
                .activeNurses(activeNurses)
                .totalAppointments(totalAppointments)
                .build();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::from)
                .toList();
    }

    public UserDto createUser(AdminCreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw AppException.conflict("This email is already registered");
        }
        if (userRepository.existsByMobileNumber(req.getMobileNumber())) {
            throw AppException.conflict("This mobile number is already registered");
        }

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .mobileNumber(req.getMobileNumber())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .isActive(true)
                .build();

        return UserDto.from(userRepository.save(user));
    }

    public UserDto updateUserRole(Long id, AdminUpdateRoleRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));

        user.setRole(req.getRole());
        return UserDto.from(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
        userRepository.delete(user);
    }

    public List<RoleCountDto> getRoleCounts() {
        return Arrays.stream(Role.values())
                .map(role -> new RoleCountDto(role, userRepository.countByRole(role)))
                .toList();
    }
}

package com.pms.backend.admin.service;

import com.pms.backend.admin.dto.AdminCreateUserRequest;
import com.pms.backend.admin.dto.AdminUpdateRoleRequest;
import com.pms.backend.admin.dto.AdminUpdateUserRequest;
import com.pms.backend.appointment.repository.AppointmentRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Role role) {
        User user = User.builder()
                .id(99L)
                .email("caller@pms.local")
                .role(role)
                .isActive(true)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    @Test
    void testCreateUser_ManagementUserCannotCreateAdmin() {
        authenticateAs(Role.MANAGEMENT);

        AdminCreateUserRequest req = new AdminCreateUserRequest();
        req.setEmail("newadmin@pms.local");
        req.setMobileNumber("0771234567");
        req.setFirstName("New");
        req.setLastName("Admin");
        req.setPassword("Password123!");
        req.setRole(Role.ADMIN);

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.createUser(req);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        assertTrue(exception.getMessage().contains("Management users cannot create Administrator accounts"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testCreateUser_ManagementUserCannotCreateSuperAdmin() {
        authenticateAs(Role.MANAGEMENT);

        AdminCreateUserRequest req = new AdminCreateUserRequest();
        req.setEmail("newsuper@pms.local");
        req.setMobileNumber("0771234568");
        req.setRole(Role.SUPER_ADMIN);

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.createUser(req);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testCreateUser_ManagementUserCanCreateOperationalRoles() {
        authenticateAs(Role.MANAGEMENT);

        AdminCreateUserRequest req = new AdminCreateUserRequest();
        req.setEmail("doctor.ops@pms.local");
        req.setMobileNumber("0771234569");
        req.setFirstName("Sarah");
        req.setLastName("Doctor");
        req.setPassword("Password123!");
        req.setRole(Role.DOCTOR);

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(userRepository.existsByMobileNumber(req.getMobileNumber())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");

        User saved = User.builder()
                .id(101L)
                .email(req.getEmail())
                .role(Role.DOCTOR)
                .isActive(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDto result = adminService.createUser(req);
        assertNotNull(result);
        assertEquals(Role.DOCTOR, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUserRole_ManagementCannotAssignAdminRole() {
        authenticateAs(Role.MANAGEMENT);

        User targetUser = User.builder()
                .id(10L)
                .role(Role.DOCTOR)
                .build();
        when(userRepository.findById(10L)).thenReturn(Optional.of(targetUser));

        AdminUpdateRoleRequest req = new AdminUpdateRoleRequest();
        req.setRole(Role.ADMIN);

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.updateUserRole(10L, req);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        assertTrue(exception.getMessage().contains("Management users cannot assign Administrator roles"));
    }

    @Test
    void testUpdateUserRole_ManagementCannotModifyAdminAccount() {
        authenticateAs(Role.MANAGEMENT);

        User adminTarget = User.builder()
                .id(5L)
                .role(Role.ADMIN)
                .build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(adminTarget));

        AdminUpdateRoleRequest req = new AdminUpdateRoleRequest();
        req.setRole(Role.RECEPTIONIST);

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.updateUserRole(5L, req);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        assertTrue(exception.getMessage().contains("Management users cannot modify Administrator accounts"));
    }

    @Test
    void testUpdateUser_ManagementCannotModifyAdminProfile() {
        authenticateAs(Role.MANAGEMENT);

        User adminTarget = User.builder()
                .id(5L)
                .role(Role.ADMIN)
                .build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(adminTarget));

        AdminUpdateUserRequest req = new AdminUpdateUserRequest();
        req.setFirstName("Hacked");

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.updateUser(5L, req);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        assertTrue(exception.getMessage().contains("Management users cannot modify Administrator accounts"));
    }

    @Test
    void testDeleteUser_ManagementCannotDeleteAdmin() {
        authenticateAs(Role.MANAGEMENT);

        User adminTarget = User.builder()
                .id(5L)
                .role(Role.SUPER_ADMIN)
                .build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(adminTarget));

        AppException exception = assertThrows(AppException.class, () -> {
            adminService.deleteUser(5L);
        });

        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, exception.getStatus());
        assertTrue(exception.getMessage().contains("Management users cannot delete Administrator accounts"));
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testGetAllUsers_ManagementFilterHidesAdminAndSuperAdmin() {
        authenticateAs(Role.MANAGEMENT);

        List<User> allUsers = List.of(
                User.builder().id(1L).email("super@pms.local").role(Role.SUPER_ADMIN).build(),
                User.builder().id(2L).email("admin@pms.local").role(Role.ADMIN).build(),
                User.builder().id(3L).email("nurse@pms.local").role(Role.NURSE).build(),
                User.builder().id(4L).email("doctor@pms.local").role(Role.DOCTOR).build()
        );
        when(userRepository.findAll()).thenReturn(allUsers);

        List<UserDto> visibleUsers = adminService.getAllUsers();

        assertEquals(2, visibleUsers.size());
        assertTrue(visibleUsers.stream().noneMatch(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN));
    }

    @Test
    void testGetAllUsers_AdminSeesAllRoles() {
        authenticateAs(Role.ADMIN);

        List<User> allUsers = List.of(
                User.builder().id(1L).email("super@pms.local").role(Role.SUPER_ADMIN).build(),
                User.builder().id(2L).email("admin@pms.local").role(Role.ADMIN).build(),
                User.builder().id(3L).email("nurse@pms.local").role(Role.NURSE).build()
        );
        when(userRepository.findAll()).thenReturn(allUsers);

        List<UserDto> visibleUsers = adminService.getAllUsers();
        assertEquals(3, visibleUsers.size());
    }
}

package com.pms.backend.admin.service;

import com.pms.backend.admin.dto.AdminCreateUserRequest;
import com.pms.backend.admin.dto.AdminStatsDto;
import com.pms.backend.admin.dto.AdminUpdateRoleRequest;
import com.pms.backend.admin.dto.AdminUpdateUserRequest;
import com.pms.backend.admin.dto.RoleCountDto;
import com.pms.backend.appointment.repository.AppointmentRepository;
import com.pms.backend.auth.service.SecurityUtil;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Comprehensive Unit Tests")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private MockedStatic<SecurityUtil> mockedSecurityUtil;
    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        mockedSecurityUtil = mockStatic(SecurityUtil.class);

        adminUser = User.builder()
                .id(1L)
                .email("admin@hospital.org")
                .role(Role.ADMIN)
                .build();

        regularUser = User.builder()
                .id(10L)
                .firstName("John")
                .lastName("Doe")
                .email("john@hospital.org")
                .mobileNumber("+15551111")
                .role(Role.DOCTOR)
                .isActive(true)
                .passwordHash("hashedPass")
                .build();

        mockedSecurityUtil.when(SecurityUtil::getCurrentUser).thenReturn(adminUser);
    }

    @AfterEach
    void tearDown() {
        if (mockedSecurityUtil != null) {
            mockedSecurityUtil.close();
        }
    }

    @Nested
    @DisplayName("getDashboardStats()")
    class DashboardStatsTests {

        @Test
        @DisplayName("Returns correct aggregation counts")
        void getDashboardStats_Success() {
            when(userRepository.count()).thenReturn(50L);
            when(userRepository.countByRole(Role.DOCTOR)).thenReturn(10L);
            when(userRepository.countByRole(Role.NURSE)).thenReturn(15L);
            when(appointmentRepository.count()).thenReturn(120L);

            AdminStatsDto stats = adminService.getDashboardStats();

            assertThat(stats.getTotalUsers()).isEqualTo(50L);
            assertThat(stats.getActiveDoctors()).isEqualTo(10L);
            assertThat(stats.getActiveNurses()).isEqualTo(15L);
            assertThat(stats.getTotalAppointments()).isEqualTo(120L);
        }
    }

    @Nested
    @DisplayName("getAllUsers()")
    class GetAllUsersTests {

        @Test
        @DisplayName("When admin calls, returns all users without exclusion")
        void getAllUsers_AsAdmin_ReturnsAll() {
            User superAdmin = User.builder().id(2L).role(Role.SUPER_ADMIN).email("super@hospital.org").build();
            when(userRepository.findAll()).thenReturn(List.of(adminUser, superAdmin, regularUser));

            List<UserDto> users = adminService.getAllUsers();

            assertThat(users).hasSize(3);
        }
    }

    @Nested
    @DisplayName("createUser()")
    class CreateUserTests {

        private AdminCreateUserRequest createReq;

        @BeforeEach
        void initReq() {
            createReq = new AdminCreateUserRequest();
            createReq.setFirstName("Sarah");
            createReq.setLastName("Connor");
            createReq.setEmail("sarah@hospital.org");
            createReq.setMobileNumber("+15559999");
            createReq.setPassword("secret123");
            createReq.setRole(Role.NURSE);
        }

        @Test
        @DisplayName("Happy path: hashes password and saves user")
        void createUser_Success() {
            when(userRepository.existsByEmail("sarah@hospital.org")).thenReturn(false);
            when(userRepository.existsByMobileNumber("+15559999")).thenReturn(false);
            when(passwordEncoder.encode("secret123")).thenReturn("encodedSecret");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(25L);
                return u;
            });

            UserDto created = adminService.createUser(createReq);

            assertThat(created.getId()).isEqualTo(25L);
            assertThat(created.getEmail()).isEqualTo("sarah@hospital.org");
            assertThat(created.getRole()).isEqualTo(Role.NURSE);
            verify(passwordEncoder).encode("secret123");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT if email already registered")
        void createUser_EmailConflict() {
            when(userRepository.existsByEmail("sarah@hospital.org")).thenReturn(true);

            assertThatThrownBy(() -> adminService.createUser(createReq))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("This email is already registered");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT if mobile number already registered")
        void createUser_MobileConflict() {
            when(userRepository.existsByEmail("sarah@hospital.org")).thenReturn(false);
            when(userRepository.existsByMobileNumber("+15559999")).thenReturn(true);

            assertThatThrownBy(() -> adminService.createUser(createReq))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("This mobile number is already registered");
                    });

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateUserRole()")
    class UpdateUserRoleTests {

        @Test
        @DisplayName("Happy path: updates role and saves")
        void updateUserRole_Success() {
            when(userRepository.findById(10L)).thenReturn(Optional.of(regularUser));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            AdminUpdateRoleRequest req = new AdminUpdateRoleRequest();
            req.setRole(Role.PHARMACIST);

            UserDto updated = adminService.updateUserRole(10L, req);

            assertThat(updated.getRole()).isEqualTo(Role.PHARMACIST);
            verify(userRepository).save(regularUser);
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when target user does not exist")
        void updateUserRole_UserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            AdminUpdateRoleRequest req = new AdminUpdateRoleRequest();
            req.setRole(Role.PHARMACIST);

            assertThatThrownBy(() -> adminService.updateUserRole(99L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateUser()")
    class UpdateUserTests {

        @Test
        @DisplayName("Happy path: updates fields and encodes new password")
        void updateUser_Success() {
            when(userRepository.findById(10L)).thenReturn(Optional.of(regularUser));
            when(userRepository.existsByEmailAndIdNot("newemail@hospital.org", 10L)).thenReturn(false);
            when(userRepository.existsByMobileNumberAndIdNot("+15558888", 10L)).thenReturn(false);
            when(passwordEncoder.encode("newPassword")).thenReturn("newHashedPass");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            AdminUpdateUserRequest req = new AdminUpdateUserRequest();
            req.setFirstName("Johnny");
            req.setLastName("Bravo");
            req.setEmail("newemail@hospital.org");
            req.setMobileNumber("+15558888");
            req.setPassword("newPassword");
            req.setRole(Role.LAB_TECHNICIAN);
            req.setIsActive(false);

            UserDto updated = adminService.updateUser(10L, req);

            assertThat(updated.getFirstName()).isEqualTo("Johnny");
            assertThat(updated.getLastName()).isEqualTo("Bravo");
            assertThat(updated.getEmail()).isEqualTo("newemail@hospital.org");
            assertThat(updated.getMobileNumber()).isEqualTo("+15558888");
            assertThat(updated.getRole()).isEqualTo(Role.LAB_TECHNICIAN);
            assertThat(regularUser.isActive()).isFalse();
            verify(passwordEncoder).encode("newPassword");
            verify(userRepository).save(regularUser);
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when user does not exist")
        void updateUser_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            AdminUpdateUserRequest req = new AdminUpdateUserRequest();

            assertThatThrownBy(() -> adminService.updateUser(99L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT when email is claimed by another user")
        void updateUser_EmailConflict() {
            when(userRepository.findById(10L)).thenReturn(Optional.of(regularUser));
            when(userRepository.existsByEmailAndIdNot("existing@hospital.org", 10L)).thenReturn(true);

            AdminUpdateUserRequest req = new AdminUpdateUserRequest();
            req.setEmail("existing@hospital.org");

            assertThatThrownBy(() -> adminService.updateUser(10L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("This email is already registered");
                    });
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT when mobile is claimed by another user")
        void updateUser_MobileConflict() {
            when(userRepository.findById(10L)).thenReturn(Optional.of(regularUser));
            when(userRepository.existsByMobileNumberAndIdNot("+15550000", 10L)).thenReturn(true);

            AdminUpdateUserRequest req = new AdminUpdateUserRequest();
            req.setMobileNumber("+15550000");

            assertThatThrownBy(() -> adminService.updateUser(10L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("This mobile number is already registered");
                    });
        }
    }

    @Nested
    @DisplayName("deleteUser() and getRoleCounts()")
    class DeleteAndRoleCountTests {

        @Test
        @DisplayName("deleteUser: successfully deletes user")
        void deleteUser_Success() {
            when(userRepository.findById(10L)).thenReturn(Optional.of(regularUser));

            adminService.deleteUser(10L);

            verify(userRepository).delete(regularUser);
        }

        @Test
        @DisplayName("deleteUser: fails with 404 NOT_FOUND when user not found")
        void deleteUser_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminService.deleteUser(99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("getRoleCounts: returns counts for all roles")
        void getRoleCounts_Success() {
            when(userRepository.countByRole(any(Role.class))).thenReturn(5L);

            List<RoleCountDto> roleCounts = adminService.getRoleCounts();

            assertThat(roleCounts).hasSize(Role.values().length);
            assertThat(roleCounts.get(0).getCount()).isEqualTo(5L);
        }
    }
}

package com.pms.backend.management.service;

import com.pms.backend.auth.service.SecurityUtil;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.management.dto.ManagementUpdateDoctorRequest;
import com.pms.backend.management.dto.ManagementUpdateUserRequest;
import com.pms.backend.management.entity.ManagementActivityLog;
import com.pms.backend.management.repository.ManagementActivityLogRepository;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ManagementService Unit Tests")
class ManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private ManagementActivityLogRepository activityLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ManagementService managementService;

    private MockedStatic<SecurityUtil> mockedSecurityUtil;
    private User managerUser;
    private User operationalUser;
    private Doctor operationalDoctor;

    @BeforeEach
    void setUp() {
        mockedSecurityUtil = mockStatic(SecurityUtil.class);

        managerUser = User.builder()
                .id(2L)
                .email("manager@hospital.org")
                .role(Role.MANAGEMENT)
                .build();

        operationalUser = User.builder()
                .id(15L)
                .firstName("Clara")
                .lastName("Oswald")
                .email("clara@hospital.org")
                .mobileNumber("+15557777")
                .role(Role.NURSE)
                .isActive(true)
                .build();

        operationalDoctor = Doctor.builder()
                .id(50L)
                .user(operationalUser)
                .specialization("Pediatrics")
                .hospital("City Hospital")
                .department("Pediatrics Ward")
                .consultationFee(150.0)
                .bio("Pediatric specialist")
                .isAvailable(true)
                .build();

        mockedSecurityUtil.when(SecurityUtil::getCurrentUser).thenReturn(managerUser);
    }

    @AfterEach
    void tearDown() {
        if (mockedSecurityUtil != null) {
            mockedSecurityUtil.close();
        }
    }

    @Nested
    @DisplayName("Admin Account Protection Branches")
    class AdminProtectionTests {

        @Test
        @DisplayName("updateUser: fails with 403 when target user is ADMIN")
        void updateUser_TargetIsAdmin_ThrowsForbidden() {
            User adminTarget = User.builder().id(3L).role(Role.ADMIN).build();
            when(userRepository.findById(3L)).thenReturn(Optional.of(adminTarget));

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();

            assertThatThrownBy(() -> managementService.updateUser(3L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(appEx.getMessage()).isEqualTo("Management users cannot modify Administrator accounts");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("updateUser: fails with 403 when target user is SUPER_ADMIN")
        void updateUser_TargetIsSuperAdmin_ThrowsForbidden() {
            User superAdminTarget = User.builder().id(4L).role(Role.SUPER_ADMIN).build();
            when(userRepository.findById(4L)).thenReturn(Optional.of(superAdminTarget));

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();

            assertThatThrownBy(() -> managementService.updateUser(4L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(appEx.getMessage()).isEqualTo("Management users cannot modify Administrator accounts");
                    });
        }

        @Test
        @DisplayName("updateUser: fails with 403 when trying to assign ADMIN role")
        void updateUser_AssignAdminRole_ThrowsForbidden() {
            when(userRepository.findById(15L)).thenReturn(Optional.of(operationalUser));

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();
            req.setRole(Role.ADMIN);

            assertThatThrownBy(() -> managementService.updateUser(15L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(appEx.getMessage()).isEqualTo("Management users cannot assign Administrator accounts");
                    });
        }

        @Test
        @DisplayName("updateDoctor: fails with 403 when doctor user has ADMIN role")
        void updateDoctor_DoctorLinkedToAdmin_ThrowsForbidden() {
            User adminDocUser = User.builder().id(99L).role(Role.ADMIN).build();
            Doctor adminDoctor = Doctor.builder().id(70L).user(adminDocUser).build();
            when(doctorRepository.findById(70L)).thenReturn(Optional.of(adminDoctor));

            ManagementUpdateDoctorRequest req = new ManagementUpdateDoctorRequest();

            assertThatThrownBy(() -> managementService.updateDoctor(70L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(appEx.getMessage()).isEqualTo("Management users cannot modify Administrator accounts");
                    });

            verify(doctorRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Validation and Conflict Failures")
    class ValidationFailureTests {

        @Test
        @DisplayName("updateUser: fails with 404 NOT_FOUND when user does not exist")
        void updateUser_NotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();

            assertThatThrownBy(() -> managementService.updateUser(999L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        }

        @Test
        @DisplayName("updateUser: fails with 409 CONFLICT on email collision")
        void updateUser_EmailConflict() {
            when(userRepository.findById(15L)).thenReturn(Optional.of(operationalUser));
            when(userRepository.existsByEmailAndIdNot("taken@hospital.org", 15L)).thenReturn(true);

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();
            req.setEmail("taken@hospital.org");

            assertThatThrownBy(() -> managementService.updateUser(15L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
        }

        @Test
        @DisplayName("updateUser: fails with 409 CONFLICT on mobile collision")
        void updateUser_MobileConflict() {
            when(userRepository.findById(15L)).thenReturn(Optional.of(operationalUser));
            when(userRepository.existsByMobileNumberAndIdNot("+15550000", 15L)).thenReturn(true);

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();
            req.setMobileNumber("+15550000");

            assertThatThrownBy(() -> managementService.updateUser(15L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
        }

        @Test
        @DisplayName("updateDoctor: fails with 404 NOT_FOUND when doctor does not exist")
        void updateDoctor_NotFound() {
            when(doctorRepository.findById(888L)).thenReturn(Optional.empty());

            ManagementUpdateDoctorRequest req = new ManagementUpdateDoctorRequest();

            assertThatThrownBy(() -> managementService.updateDoctor(888L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        }
    }

    @Nested
    @DisplayName("Happy Path Workflows and Activity Logging")
    class HappyPathTests {

        @Test
        @DisplayName("updateUser: successfully applies updates, saves user, and writes activity log")
        void updateUser_Success() {
            when(userRepository.findById(15L)).thenReturn(Optional.of(operationalUser));
            when(userRepository.existsByEmailAndIdNot("clara.new@hospital.org", 15L)).thenReturn(false);
            when(userRepository.existsByMobileNumberAndIdNot("+15556666", 15L)).thenReturn(false);
            when(passwordEncoder.encode("newSecret")).thenReturn("encodedSecret");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            ManagementUpdateUserRequest req = new ManagementUpdateUserRequest();
            req.setFirstName("Clarissa");
            req.setLastName("Oswald-Pond");
            req.setEmail("clara.new@hospital.org");
            req.setMobileNumber("+15556666");
            req.setPassword("newSecret");
            req.setRole(Role.DOCTOR);
            req.setIsActive(false);

            UserDto result = managementService.updateUser(15L, req);

            assertThat(result.getFirstName()).isEqualTo("Clarissa");
            assertThat(result.getLastName()).isEqualTo("Oswald-Pond");
            assertThat(result.getEmail()).isEqualTo("clara.new@hospital.org");
            assertThat(result.getMobileNumber()).isEqualTo("+15556666");
            assertThat(result.getRole()).isEqualTo(Role.DOCTOR);
            assertThat(operationalUser.isActive()).isFalse();

            verify(userRepository).save(operationalUser);
            verify(activityLogRepository).save(any(ManagementActivityLog.class));
        }

        @Test
        @DisplayName("updateDoctor: successfully updates doctor fields, saves, and writes activity log")
        void updateDoctor_Success() {
            when(doctorRepository.findById(50L)).thenReturn(Optional.of(operationalDoctor));
            when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

            ManagementUpdateDoctorRequest req = new ManagementUpdateDoctorRequest();
            req.setSpecialization("Pediatric Oncology");
            req.setHospital("Metro Children Hospital");
            req.setDepartment("Oncology Unit");
            req.setConsultationFee(220.0);
            req.setBio("Updated pediatric oncology bio");
            req.setIsAvailable(false);

            DoctorDto result = managementService.updateDoctor(50L, req);

            assertThat(result.getSpecialization()).isEqualTo("Pediatric Oncology");
            assertThat(result.getHospital()).isEqualTo("Metro Children Hospital");
            assertThat(result.getConsultationFee()).isEqualTo(220.0);
            assertThat(result.getIsAvailable()).isFalse();

            verify(doctorRepository).save(operationalDoctor);
            verify(activityLogRepository).save(any(ManagementActivityLog.class));
        }
    }
}

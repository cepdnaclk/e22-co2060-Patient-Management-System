package com.pms.backend.doctor.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorService Unit Tests")
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DoctorService doctorService;

    private User sampleUser;
    private Doctor sampleDoctor;
    private DoctorDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .firstName("Gregory")
                .lastName("House")
                .email("drhouse@princeton.local")
                .mobileNumber("+15550199")
                .role(Role.DOCTOR)
                .isActive(true)
                .build();

        sampleDoctor = Doctor.builder()
                .id(10L)
                .user(sampleUser)
                .specialization("Diagnostics & Nephrology")
                .licenseNumber("MD-12345")
                .hospital("Princeton-Plainsboro")
                .department("Diagnostic Medicine")
                .consultationFee(250.0)
                .bio("Specialist in infectious diseases and nephrology")
                .isAvailable(true)
                .build();

        sampleDto = DoctorDto.builder()
                .specialization("Diagnostics & Nephrology")
                .licenseNumber("MD-12345")
                .hospital("Princeton-Plainsboro")
                .department("Diagnostic Medicine")
                .consultationFee(250.0)
                .bio("Specialist in infectious diseases and nephrology")
                .isAvailable(true)
                .build();
    }

    @Nested
    @DisplayName("createDoctor()")
    class CreateDoctorTests {

        @Test
        @DisplayName("Happy path: creates and returns DoctorDto")
        void createDoctor_Success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(doctorRepository.existsByUserId(1L)).thenReturn(false);
            when(doctorRepository.findByLicenseNumber("MD-12345")).thenReturn(Optional.empty());
            when(doctorRepository.save(any(Doctor.class))).thenAnswer(invocation -> {
                Doctor d = invocation.getArgument(0);
                d.setId(10L);
                return d;
            });

            DoctorDto result = doctorService.createDoctor(1L, sampleDto);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(10L);
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getFirstName()).isEqualTo("Gregory");
            assertThat(result.getSpecialization()).isEqualTo("Diagnostics & Nephrology");
            assertThat(result.getLicenseNumber()).isEqualTo("MD-12345");
            verify(doctorRepository).save(any(Doctor.class));
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when User does not exist")
        void createDoctor_UserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.createDoctor(99L, sampleDto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(appEx.getMessage()).isEqualTo("User not found");
                    });

            verify(doctorRepository, never()).save(any());
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT when Doctor profile already exists for user")
        void createDoctor_ProfileAlreadyExists() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(doctorRepository.existsByUserId(1L)).thenReturn(true);

            assertThatThrownBy(() -> doctorService.createDoctor(1L, sampleDto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("Doctor profile already exists for this user");
                    });

            verify(doctorRepository, never()).save(any());
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT when license number is already registered")
        void createDoctor_LicenseNumberExists() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(doctorRepository.existsByUserId(1L)).thenReturn(false);
            when(doctorRepository.findByLicenseNumber("MD-12345")).thenReturn(Optional.of(sampleDoctor));

            assertThatThrownBy(() -> doctorService.createDoctor(1L, sampleDto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("License number already exists");
                    });

            verify(doctorRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getDoctorById()")
    class GetDoctorByIdTests {

        @Test
        @DisplayName("Happy path: returns DoctorDto")
        void getDoctorById_Success() {
            when(doctorRepository.findById(10L)).thenReturn(Optional.of(sampleDoctor));

            DoctorDto result = doctorService.getDoctorById(10L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(10L);
            assertThat(result.getFirstName()).isEqualTo("Gregory");
            assertThat(result.getEmail()).isEqualTo("drhouse@princeton.local");
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when doctor ID not found")
        void getDoctorById_NotFound() {
            when(doctorRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.getDoctorById(999L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(appEx.getMessage()).isEqualTo("Doctor not found");
                    });
        }

        @Test
        @DisplayName("Fails with 409 CONFLICT when doctor has no linked user")
        void getDoctorById_NoLinkedUser() {
            sampleDoctor.setUser(null);
            when(doctorRepository.findById(10L)).thenReturn(Optional.of(sampleDoctor));

            assertThatThrownBy(() -> doctorService.getDoctorById(10L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(appEx.getMessage()).isEqualTo("Doctor profile has no linked user");
                    });
        }
    }

    @Nested
    @DisplayName("getDoctorByUserId()")
    class GetDoctorByUserIdTests {

        @Test
        @DisplayName("Happy path: returns doctor profile for DOCTOR role")
        void getDoctorByUserId_DoctorRole_Success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(doctorRepository.findByUserId(1L)).thenReturn(Optional.of(sampleDoctor));

            DoctorDto result = doctorService.getDoctorByUserId(1L);

            assertThat(result).isNotNull();
            assertThat(result.getSpecialization()).isEqualTo("Diagnostics & Nephrology");
            assertThat(result.getEmail()).isEqualTo("drhouse@princeton.local");
        }

        @Test
        @DisplayName("Non-DOCTOR role (e.g. NURSE): returns basic user info without querying doctorRepo")
        void getDoctorByUserId_NonDoctorRole_ReturnsBasicInfo() {
            User nurse = User.builder()
                    .id(2L)
                    .firstName("Florence")
                    .lastName("Nightingale")
                    .email("florence@hospital.org")
                    .mobileNumber("+15550200")
                    .role(Role.NURSE)
                    .build();

            when(userRepository.findById(2L)).thenReturn(Optional.of(nurse));

            DoctorDto result = doctorService.getDoctorByUserId(2L);

            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(2L);
            assertThat(result.getFirstName()).isEqualTo("Florence");
            assertThat(result.getSpecialization()).isNull();
            verify(doctorRepository, never()).findByUserId(any());
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when User not found")
        void getDoctorByUserId_UserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.getDoctorByUserId(99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    });
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when DOCTOR has no doctor entity")
        void getDoctorByUserId_DoctorProfileNotFound() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.getDoctorByUserId(1L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(appEx.getMessage()).isEqualTo("Doctor profile not found");
                    });
        }
    }

    @Nested
    @DisplayName("Queries: getAllDoctors(), getDoctorsBySpecialization(), getAvailableDoctors()")
    class QueryTests {

        @Test
        @DisplayName("getAllDoctors filters out records where user is null")
        void getAllDoctors_FiltersNullUser() {
            Doctor brokenDoctor = Doctor.builder().id(99L).user(null).build();
            when(doctorRepository.findAll()).thenReturn(List.of(sampleDoctor, brokenDoctor));

            List<DoctorDto> result = doctorService.getAllDoctors();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("getDoctorsBySpecialization returns matching doctors")
        void getDoctorsBySpecialization_Success() {
            when(doctorRepository.findBySpecialization("Cardiology")).thenReturn(List.of(sampleDoctor));

            List<DoctorDto> result = doctorService.getDoctorsBySpecialization("Cardiology");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getLicenseNumber()).isEqualTo("MD-12345");
        }

        @Test
        @DisplayName("getAvailableDoctors returns available doctors")
        void getAvailableDoctors_Success() {
            when(doctorRepository.findByIsAvailableTrue()).thenReturn(List.of(sampleDoctor));

            List<DoctorDto> result = doctorService.getAvailableDoctors();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getIsAvailable()).isTrue();
        }
    }

    @Nested
    @DisplayName("updateDoctor() and deleteDoctor()")
    class UpdateAndDeleteTests {

        @Test
        @DisplayName("updateDoctor: successfully updates fields and saves")
        void updateDoctor_Success() {
            when(doctorRepository.findById(10L)).thenReturn(Optional.of(sampleDoctor));
            when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

            DoctorDto updateReq = DoctorDto.builder()
                    .specialization("Neurology")
                    .hospital("New Hospital")
                    .department("Neuro Ward")
                    .consultationFee(300.0)
                    .bio("Updated bio")
                    .isAvailable(false)
                    .build();

            DoctorDto result = doctorService.updateDoctor(10L, updateReq);

            assertThat(result.getSpecialization()).isEqualTo("Neurology");
            assertThat(result.getHospital()).isEqualTo("New Hospital");
            assertThat(result.getConsultationFee()).isEqualTo(300.0);
            assertThat(result.getIsAvailable()).isFalse();
            verify(doctorRepository).save(sampleDoctor);
        }

        @Test
        @DisplayName("updateDoctor: fails with 404 NOT_FOUND when doctor does not exist")
        void updateDoctor_NotFound() {
            when(doctorRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.updateDoctor(99L, sampleDto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

            verify(doctorRepository, never()).save(any());
        }

        @Test
        @DisplayName("deleteDoctor: successfully deletes existing doctor")
        void deleteDoctor_Success() {
            when(doctorRepository.findById(10L)).thenReturn(Optional.of(sampleDoctor));

            doctorService.deleteDoctor(10L);

            verify(doctorRepository).delete(sampleDoctor);
        }

        @Test
        @DisplayName("deleteDoctor: fails with 404 NOT_FOUND when doctor does not exist")
        void deleteDoctor_NotFound() {
            when(doctorRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> doctorService.deleteDoctor(99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

            verify(doctorRepository, never()).delete(any());
        }
    }
}

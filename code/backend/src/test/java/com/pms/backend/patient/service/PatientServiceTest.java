package com.pms.backend.patient.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.patient.dto.PatientRegistrationRequest;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PatientService patientService;

    @Test
    void testRegisterPatient_EmailAlreadyExists_ThrowsException() {
        PatientRegistrationRequest request = new PatientRegistrationRequest();
        request.setEmail("duplicate@test.com");
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> {
            patientService.registerPatient(request);
        });
        assertEquals("This email is already registered", exception.getMessage());
        
        verify(userRepository, never()).save(any());
        verify(patientRepository, never()).save(any());
    }

    @Test
    void testRegisterPatient_Success() {
        PatientRegistrationRequest request = new PatientRegistrationRequest();
        request.setEmail("new@test.com");
        request.setMobileNumber("1234567890");
        request.setFirstName("John");
        request.setLastName("Doe");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByMobileNumber(request.getMobileNumber())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        
        User savedUser = new User();
        savedUser.setId(1L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        Patient savedPatient = new Patient();
        savedPatient.setId(1L);
        savedPatient.setUser(savedUser);
        when(patientRepository.save(any(Patient.class))).thenReturn(savedPatient);

        PatientDto result = patientService.registerPatient(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(userRepository, times(1)).save(any(User.class));
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testCreatePatientFromUser_GeneratesFormattedPatientId() {
        User user = User.builder().id(7L).firstName("Bob").lastName("Ross").email("bob@test.com").build();
        when(patientRepository.existsByUserId(7L)).thenReturn(false);

        Patient initialPatient = Patient.builder().id(12L).user(user).build();
        when(patientRepository.save(any(Patient.class))).thenReturn(initialPatient);

        PatientDto result = patientService.createPatientFromUser(user);

        assertNotNull(result);
        assertEquals("P-00012", result.getPatientId());
        verify(patientRepository, times(2)).save(any(Patient.class));
    }

    @Test
    void testUpdatePatient_CriticalStatusTransition_NotifiesAllActiveDoctors() {
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").build();
        Patient existingPatient = Patient.builder()
                .id(1L)
                .user(patientUser)
                .criticalStatus(false) // previously FALSE
                .build();
        when(patientRepository.findById(1L)).thenReturn(Optional.of(existingPatient));

        User doc1 = User.builder().id(20L).role(Role.DOCTOR).isActive(true).build();
        User doc2 = User.builder().id(21L).role(Role.DOCTOR).isActive(true).build();
        when(userRepository.findByRoleAndIsActive(Role.DOCTOR, true)).thenReturn(List.of(doc1, doc2));

        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        PatientDto updateDto = PatientDto.builder()
                .criticalStatus(true) // transition to TRUE
                .build();

        PatientDto result = patientService.updatePatient(1L, updateDto);

        assertNotNull(result);
        assertTrue(result.getCriticalStatus());
        verify(notificationService, times(1)).createNotification(
                eq(20L), anyString(), contains("CRITICAL"), eq(NotificationType.CRITICAL_ALERT), eq(1L));
        verify(notificationService, times(1)).createNotification(
                eq(21L), anyString(), contains("CRITICAL"), eq(NotificationType.CRITICAL_ALERT), eq(1L));
    }

    @Test
    void testUpdatePatient_CriticalStatusNoTransition_DoesNotNotifyAgain() {
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").build();
        Patient existingPatient = Patient.builder()
                .id(1L)
                .user(patientUser)
                .criticalStatus(true) // ALREADY TRUE
                .build();
        when(patientRepository.findById(1L)).thenReturn(Optional.of(existingPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        PatientDto updateDto = PatientDto.builder()
                .criticalStatus(true) // save again with TRUE
                .build();

        PatientDto result = patientService.updatePatient(1L, updateDto);

        assertNotNull(result);
        assertTrue(result.getCriticalStatus());
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }
}

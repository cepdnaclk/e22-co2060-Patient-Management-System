package com.pms.backend.medicalrecord.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.medicalrecord.dto.MedicalRecordDto;
import com.pms.backend.medicalrecord.entity.MedicalRecord;
import com.pms.backend.medicalrecord.repository.MedicalRecordRepository;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
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
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceWorkflowTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MedicalRecordService medicalRecordService;

    @Test
    void testCreateMedicalRecord_LabTestOrdered_NotifiesAllActiveLabTechs() {
        // Arrange
        User patientUser = User.builder().id(1L).firstName("Alice").lastName("Brown").build();
        Patient patient = Patient.builder().id(10L).user(patientUser).build();
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));

        User doctorUser = User.builder().id(2L).firstName("Greg").lastName("House").build();
        Doctor doctor = Doctor.builder().id(5L).user(doctorUser).build();
        when(doctorRepository.findByUserId(2L)).thenReturn(Optional.of(doctor));

        User labTech1 = User.builder().id(30L).email("tech1@pms.local").role(Role.LAB_TECHNICIAN).build();
        User labTech2 = User.builder().id(31L).email("tech2@pms.local").role(Role.LAB_TECHNICIAN).build();
        when(userRepository.findByRoleAndIsActive(Role.LAB_TECHNICIAN, true)).thenReturn(List.of(labTech1, labTech2));

        MedicalRecord savedRecord = MedicalRecord.builder()
                .id(100L)
                .patient(patient)
                .doctor(doctor)
                .recordType("LAB_RESULT")
                .testName("Full Blood Count")
                .testResult(null)
                .attachmentUrl(null)
                .build();
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(savedRecord);

        MedicalRecordDto dto = MedicalRecordDto.builder()
                .patientId(10L)
                .doctorId(2L)
                .recordType("LAB_RESULT")
                .testName("Full Blood Count")
                .build();

        // Act
        MedicalRecordDto result = medicalRecordService.createMedicalRecord(dto);

        // Assert
        assertNotNull(result);
        verify(notificationService, times(1)).createNotification(
                eq(30L), eq("New Lab Test Ordered"), anyString(), eq(NotificationType.SYSTEM_ALERT), eq(100L));
        verify(notificationService, times(1)).createNotification(
                eq(31L), eq("New Lab Test Ordered"), anyString(), eq(NotificationType.SYSTEM_ALERT), eq(100L));
    }

    @Test
    void testUpdateMedicalRecord_LabResultUploaded_NotifiesDoctor() {
        // Arrange
        User doctorUser = User.builder().id(2L).firstName("Greg").lastName("House").build();
        Doctor doctor = Doctor.builder().id(5L).user(doctorUser).build();
        User patientUser = User.builder().id(1L).firstName("Alice").lastName("Brown").build();
        Patient patient = Patient.builder().id(10L).user(patientUser).build();

        MedicalRecord existingRecord = MedicalRecord.builder()
                .id(100L)
                .patient(patient)
                .doctor(doctor)
                .recordType("LAB_RESULT")
                .testName("Full Blood Count")
                .testResult(null)
                .build();
        when(medicalRecordRepository.findById(100L)).thenReturn(Optional.of(existingRecord));

        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        MedicalRecordDto updateDto = MedicalRecordDto.builder()
                .testResult("WBC count normal at 6.5 x 10^9/L")
                .attachmentUrl("fbc-results.pdf")
                .build();

        // Act
        MedicalRecordDto result = medicalRecordService.updateMedicalRecord(100L, updateDto);

        // Assert
        assertNotNull(result);
        assertEquals("WBC count normal at 6.5 x 10^9/L", result.getTestResult());
        verify(notificationService, times(1)).createNotification(
                eq(2L), eq("Lab Report Updated"), anyString(), eq(NotificationType.LAB_RESULT), eq(100L));
    }

    @Test
    void testFulfillPrescription_Success() {
        // Arrange
        User patientUser = User.builder().id(1L).firstName("Alice").lastName("Brown").build();
        Patient patient = Patient.builder().id(10L).user(patientUser).build();

        MedicalRecord record = MedicalRecord.builder()
                .id(50L)
                .patient(patient)
                .recordType("PRESCRIPTION")
                .description("Amoxicillin 500mg TID 7 days")
                .isFulfilled(false)
                .build();
        when(medicalRecordRepository.findById(50L)).thenReturn(Optional.of(record));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        MedicalRecordDto result = medicalRecordService.fulfillPrescription(50L);

        // Assert
        assertNotNull(result);
        assertTrue(result.getIsFulfilled());
        verify(medicalRecordRepository, times(1)).save(record);
    }

    @Test
    void testFulfillPrescription_NonPrescription_ThrowsBadRequest() {
        // Arrange
        MedicalRecord record = MedicalRecord.builder()
                .id(51L)
                .recordType("DIAGNOSIS")
                .description("Acute Pharyngitis")
                .build();
        when(medicalRecordRepository.findById(51L)).thenReturn(Optional.of(record));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            medicalRecordService.fulfillPrescription(51L);
        });
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Only prescriptions can be fulfilled", exception.getMessage());
    }
}

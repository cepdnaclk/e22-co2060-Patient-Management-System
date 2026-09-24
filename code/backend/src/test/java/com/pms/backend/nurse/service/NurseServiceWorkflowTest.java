package com.pms.backend.nurse.service;

import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.nurse.dto.ClinicalOrderDto;
import com.pms.backend.nurse.dto.MedAdministrationDto;
import com.pms.backend.nurse.dto.MedicationOrderDto;
import com.pms.backend.nurse.dto.VitalsRecordDto;
import com.pms.backend.nurse.entity.ClinicalOrder;
import com.pms.backend.nurse.entity.MedAdministration;
import com.pms.backend.nurse.entity.MedicationOrder;
import com.pms.backend.nurse.entity.VitalsRecord;
import com.pms.backend.nurse.repository.ClinicalOrderRepository;
import com.pms.backend.nurse.repository.MedAdministrationRepository;
import com.pms.backend.nurse.repository.MedicationOrderRepository;
import com.pms.backend.nurse.repository.VitalsRecordRepository;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NurseServiceWorkflowTest {

    @Mock
    private VitalsRecordRepository vitalsRecordRepository;

    @Mock
    private MedicationOrderRepository medicationOrderRepository;

    @Mock
    private MedAdministrationRepository medAdministrationRepository;

    @Mock
    private ClinicalOrderRepository clinicalOrderRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NurseService nurseService;

    @Test
    void testRecordVitals_AbnormalMetrics_TriggersCriticalAlertToActiveDoctors() {
        // Arrange: Patient with abnormal vitals (HR=130, SpO2=89%, Temp=40.0C)
        User patientUser = User.builder().id(10L).firstName("John").lastName("Doe").build();
        Patient patient = Patient.builder().id(1L).user(patientUser).build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        VitalsRecordDto dto = VitalsRecordDto.builder()
                .patientId(1L)
                .heartRate(130)
                .oxygenSaturation(89.0)
                .temperature(40.0)
                .respiratoryRate(24)
                .bloodPressure("150/95")
                .build();

        VitalsRecord savedRecord = VitalsRecord.builder()
                .id(100L)
                .patient(patient)
                .heartRate(130)
                .oxygenSaturation(89.0)
                .temperature(40.0)
                .respiratoryRate(24)
                .bloodPressure("150/95")
                .build();
        when(vitalsRecordRepository.save(any(VitalsRecord.class))).thenReturn(savedRecord);

        User doc1 = User.builder().id(20L).email("doc1@pms.local").role(Role.DOCTOR).isActive(true).build();
        User doc2 = User.builder().id(21L).email("doc2@pms.local").role(Role.DOCTOR).isActive(true).build();
        when(userRepository.findByRoleAndIsActive(Role.DOCTOR, true)).thenReturn(List.of(doc1, doc2));

        // Act
        VitalsRecordDto result = nurseService.recordVitals(dto);

        // Assert
        assertNotNull(result);
        assertEquals(130, result.getHeartRate());

        ArgumentCaptor<String> msgCaptor = ArgumentCaptor.forClass(String.class);
        verify(notificationService, times(1)).createNotification(
                eq(20L), anyString(), msgCaptor.capture(), eq(NotificationType.CRITICAL_ALERT), eq(1L));
        verify(notificationService, times(1)).createNotification(
                eq(21L), anyString(), anyString(), eq(NotificationType.CRITICAL_ALERT), eq(1L));

        String alertMessage = msgCaptor.getValue();
        assertTrue(alertMessage.contains("HR=130bpm"));
        assertTrue(alertMessage.contains("O2Sat=89.0%"));
        assertTrue(alertMessage.contains("Temp=40.0°C"));
    }

    @Test
    void testRecordVitals_NormalMetrics_DoesNotTriggerNotification() {
        // Arrange: Patient with normal vitals
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").build();
        Patient patient = Patient.builder().id(2L).user(patientUser).build();

        when(patientRepository.findById(2L)).thenReturn(Optional.of(patient));

        VitalsRecordDto dto = VitalsRecordDto.builder()
                .patientId(2L)
                .heartRate(72)
                .oxygenSaturation(98.0)
                .temperature(36.8)
                .respiratoryRate(16)
                .bloodPressure("120/80")
                .build();

        VitalsRecord savedRecord = VitalsRecord.builder()
                .id(101L)
                .patient(patient)
                .heartRate(72)
                .oxygenSaturation(98.0)
                .temperature(36.8)
                .respiratoryRate(16)
                .bloodPressure("120/80")
                .build();
        when(vitalsRecordRepository.save(any(VitalsRecord.class))).thenReturn(savedRecord);

        // Act
        VitalsRecordDto result = nurseService.recordVitals(dto);

        // Assert
        assertNotNull(result);
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }

    @Test
    void testAdministerMedication_RecordsAdministration() {
        Patient patient = Patient.builder().id(1L).build();
        MedicationOrder order = MedicationOrder.builder()
                .id(50L)
                .patient(patient)
                .medicationName("Amoxicillin")
                .dosage("500mg")
                .status("ACTIVE")
                .build();
        when(medicationOrderRepository.findById(50L)).thenReturn(Optional.of(order));

        User nurse = User.builder().id(30L).firstName("Clara").lastName("Nurse").build();
        when(userRepository.findById(30L)).thenReturn(Optional.of(nurse));

        MedAdministration savedAdmin = MedAdministration.builder()
                .id(200L)
                .order(order)
                .nurse(nurse)
                .status("GIVEN")
                .notes("Morning dose administered")
                .build();
        when(medAdministrationRepository.save(any(MedAdministration.class))).thenReturn(savedAdmin);

        MedAdministrationDto reqDto = MedAdministrationDto.builder()
                .orderId(50L)
                .nurseId(30L)
                .status("GIVEN")
                .notes("Morning dose administered")
                .build();

        MedAdministrationDto result = nurseService.administerMedication(reqDto);

        assertNotNull(result);
        assertEquals("GIVEN", result.getStatus());
        assertEquals("Clara Nurse", result.getNurseName());
        verify(medAdministrationRepository, times(1)).save(any(MedAdministration.class));
    }

    @Test
    void testCompleteClinicalOrder_UpdatesStatusAndCompletedFields() {
        ClinicalOrder order = ClinicalOrder.builder()
                .id(70L)
                .patient(Patient.builder().id(1L).build())
                .orderType("ECG")
                .description("Perform 12-lead ECG")
                .status("PENDING")
                .build();
        when(clinicalOrderRepository.findById(70L)).thenReturn(Optional.of(order));

        User nurse = User.builder().id(30L).firstName("Clara").lastName("Nurse").build();
        when(userRepository.findById(30L)).thenReturn(Optional.of(nurse));

        when(clinicalOrderRepository.save(any(ClinicalOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        ClinicalOrderDto result = nurseService.completeClinicalOrder(70L, 30L);

        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        assertNotNull(result.getCompletedAt());
        assertEquals(30L, result.getCompletedById());
        assertEquals("Clara Nurse", result.getCompletedByName());
        verify(clinicalOrderRepository, times(1)).save(order);
    }
}

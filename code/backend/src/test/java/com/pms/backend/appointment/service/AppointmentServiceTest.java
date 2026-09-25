package com.pms.backend.appointment.service;

import com.pms.backend.appointment.dto.AppointmentDto;
import com.pms.backend.appointment.entity.Appointment;
import com.pms.backend.appointment.repository.AppointmentRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    @Test
    void testCreateAppointment_Success_NotifiesBothDoctorAndPatient() {
        // Arrange
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").email("alice@test.com").build();
        Patient patient = Patient.builder().id(1L).user(patientUser).build();

        User docUser = User.builder().id(20L).firstName("John").lastName("Watson").build();
        Doctor doctor = Doctor.builder().id(2L).user(docUser).isAvailable(true).specialization("Cardiology").build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));

        LocalDateTime appointmentTime = LocalDateTime.now().plusDays(2);
        Appointment savedAppointment = Appointment.builder()
                .id(100L)
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(appointmentTime)
                .durationMinutes(30)
                .status("SCHEDULED")
                .reason("Cardiac checkup")
                .build();
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        AppointmentDto reqDto = AppointmentDto.builder()
                .patientId(1L)
                .doctorId(2L)
                .appointmentDateTime(appointmentTime)
                .durationMinutes(30)
                .reason("Cardiac checkup")
                .build();

        // Act
        AppointmentDto result = appointmentService.createAppointment(reqDto);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("SCHEDULED", result.getStatus());

        // Verify notification to Doctor
        verify(notificationService, times(1)).createNotification(
                eq(20L),
                eq("New Appointment Request"),
                contains("Alice Smith"),
                eq(NotificationType.APPOINTMENT),
                eq(100L)
        );

        // Verify notification to Patient
        verify(notificationService, times(1)).createNotification(
                eq(10L),
                eq("Appointment Pending"),
                contains("Dr. John Watson"),
                eq(NotificationType.APPOINTMENT),
                eq(100L)
        );
    }

    @Test
    void testCreateAppointment_UnavailableDoctor_ThrowsConflict() {
        User patientUser = User.builder().id(10L).firstName("Alice").build();
        Patient patient = Patient.builder().id(1L).user(patientUser).build();

        User docUser = User.builder().id(20L).firstName("John").build();
        Doctor doctor = Doctor.builder().id(2L).user(docUser).isAvailable(false).build(); // Unavailable!

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));

        AppointmentDto reqDto = AppointmentDto.builder()
                .patientId(1L)
                .doctorId(2L)
                .appointmentDateTime(LocalDateTime.now().plusDays(1))
                .build();

        AppException exception = assertThrows(AppException.class, () -> {
            appointmentService.createAppointment(reqDto);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Doctor is not available", exception.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void testCancelAppointment_Success_UpdatesStatusAndNotifiesBoth() {
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").build();
        Patient patient = Patient.builder().id(1L).user(patientUser).build();

        User docUser = User.builder().id(20L).firstName("John").lastName("Watson").build();
        Doctor doctor = Doctor.builder().id(2L).user(docUser).build();

        Appointment appointment = Appointment.builder()
                .id(105L)
                .patient(patient)
                .doctor(doctor)
                .status("SCHEDULED")
                .build();

        when(appointmentRepository.findById(105L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        appointmentService.cancelAppointment(105L);

        // Assert
        assertEquals("CANCELLED", appointment.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);

        // Doctor notified
        verify(notificationService, times(1)).createNotification(
                eq(20L), eq("Appointment Cancelled"), contains("Alice Smith"), eq(NotificationType.APPOINTMENT), eq(105L));

        // Patient notified
        verify(notificationService, times(1)).createNotification(
                eq(10L), eq("Appointment Cancelled"), contains("Dr. John Watson"), eq(NotificationType.APPOINTMENT), eq(105L));
    }

    @Test
    void testDoubleBooking_DocumentsAbsenceOfOverlapCheck() {
        // Documenting known defect: Two appointments at identical times for the same doctor are currently allowed
        User patientUser = User.builder().id(10L).firstName("Alice").lastName("Smith").build();
        Patient patient = Patient.builder().id(1L).user(patientUser).build();

        User docUser = User.builder().id(20L).firstName("John").lastName("Watson").build();
        Doctor doctor = Doctor.builder().id(2L).user(docUser).isAvailable(true).build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));

        LocalDateTime slotTime = LocalDateTime.of(2026, 10, 1, 10, 0);

        Appointment appt = Appointment.builder()
                .id(201L)
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(slotTime)
                .status("SCHEDULED")
                .build();
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appt);

        AppointmentDto req = AppointmentDto.builder()
                .patientId(1L)
                .doctorId(2L)
                .appointmentDateTime(slotTime)
                .build();

        // Service does not throw conflict even if already booked
        AppointmentDto created = appointmentService.createAppointment(req);
        assertNotNull(created);
        assertEquals(201L, created.getId());
    }
}

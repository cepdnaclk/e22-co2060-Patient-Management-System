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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    public AppointmentDto createAppointment(AppointmentDto appointmentDto) {
        Patient patient = patientRepository.findById(appointmentDto.getPatientId())
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));

        Doctor doctor = doctorRepository.findById(appointmentDto.getDoctorId())
                .orElseThrow(() -> new AppException("Doctor not found", HttpStatus.NOT_FOUND));

        if (!doctor.getIsAvailable()) {
            throw new AppException("Doctor is not available", HttpStatus.CONFLICT);
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(appointmentDto.getAppointmentDateTime())
                .durationMinutes(appointmentDto.getDurationMinutes() != null ? appointmentDto.getDurationMinutes() : 30)
                .reason(appointmentDto.getReason())
                .notes(appointmentDto.getNotes())
                .status("SCHEDULED")
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        String patientName = patient.getUser().getFirstName() + " " + patient.getUser().getLastName();
        String doctorFullName = "Dr. " + doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName();

        // Notify the doctor about new appointment
        notificationService.createNotification(
                doctor.getUser().getId(),
                "New Appointment Scheduled",
                "Patient " + patientName + " has booked an appointment with you" +
                        (appointmentDto.getReason() != null ? " for: " + appointmentDto.getReason() : "") + ".",
                NotificationType.APPOINTMENT,
                savedAppointment.getId()
        );

        // Notify the patient about their confirmed appointment
        notificationService.createNotification(
                patient.getUser().getId(),
                "Appointment Confirmed",
                "Your appointment with " + doctorFullName + " has been scheduled successfully.",
                NotificationType.APPOINTMENT,
                savedAppointment.getId()
        );

        return convertToDto(savedAppointment);
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found", HttpStatus.NOT_FOUND));
        return convertToDto(appointment);
    }

    public List<AppointmentDto> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto updateAppointment(Long id, AppointmentDto appointmentDto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found", HttpStatus.NOT_FOUND));

        if (appointmentDto.getAppointmentDateTime() != null) {
            appointment.setAppointmentDateTime(appointmentDto.getAppointmentDateTime());
        }
        if (appointmentDto.getDurationMinutes() != null) {
            appointment.setDurationMinutes(appointmentDto.getDurationMinutes());
        }
        if (appointmentDto.getReason() != null) {
            appointment.setReason(appointmentDto.getReason());
        }
        if (appointmentDto.getNotes() != null) {
            appointment.setNotes(appointmentDto.getNotes());
        }
        String previousStatus = appointment.getStatus();
        if (appointmentDto.getStatus() != null) {
            appointment.setStatus(appointmentDto.getStatus());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Notify patient if their appointment is confirmed, rescheduled or cancelled
        if (appointmentDto.getStatus() != null && !appointmentDto.getStatus().equals(previousStatus)) {
            String patientName = updatedAppointment.getPatient().getUser().getFirstName();
            String docName = "Dr. " + updatedAppointment.getDoctor().getUser().getFirstName() + " " + updatedAppointment.getDoctor().getUser().getLastName();
            String statusMsg = switch (appointmentDto.getStatus().toUpperCase()) {
                case "CONFIRMED"   -> "Your appointment with " + docName + " has been confirmed.";
                case "CANCELLED"   -> "Your appointment with " + docName + " has been cancelled.";
                case "COMPLETED"   -> "Your appointment with " + docName + " is marked as completed.";
                case "RESCHEDULED" -> "Your appointment with " + docName + " has been rescheduled.";
                default            -> "Your appointment status has been updated to: " + appointmentDto.getStatus();
            };
            notificationService.createNotification(
                    updatedAppointment.getPatient().getUser().getId(),
                    "Appointment Update",
                    statusMsg,
                    NotificationType.APPOINTMENT,
                    updatedAppointment.getId()
            );
        }

        return convertToDto(updatedAppointment);
    }

    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found", HttpStatus.NOT_FOUND));
        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // Notify both doctor and patient
        String patientName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
        String doctorFullName = "Dr. " + appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();

        notificationService.createNotification(
                appointment.getDoctor().getUser().getId(),
                "Appointment Cancelled",
                "Appointment with patient " + patientName + " has been cancelled.",
                NotificationType.APPOINTMENT,
                appointment.getId()
        );
        notificationService.createNotification(
                appointment.getPatient().getUser().getId(),
                "Appointment Cancelled",
                "Your appointment with " + doctorFullName + " has been cancelled.",
                NotificationType.APPOINTMENT,
                appointment.getId()
        );
    }

    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found", HttpStatus.NOT_FOUND));
        appointmentRepository.delete(appointment);
    }

    private AppointmentDto convertToDto(Appointment appointment) {
        String patientName = "Unknown";
        String patientEmail = "";
        if (appointment.getPatient() != null) {
            if (appointment.getPatient().getUser() != null) {
                patientName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
                patientEmail = appointment.getPatient().getUser().getEmail();
            } else {
                patientName = "Patient #" + appointment.getPatient().getId();
            }
        }

        String doctorName = "Unknown";
        String doctorSpecialization = "";
        if (appointment.getDoctor() != null) {
            if (appointment.getDoctor().getUser() != null) {
                doctorName = "Dr. " + appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();
            } else {
                doctorName = "Doctor #" + appointment.getDoctor().getId();
            }
            doctorSpecialization = appointment.getDoctor().getSpecialization();
        }

        return AppointmentDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .patientName(patientName)
                .patientEmail(patientEmail)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorName(doctorName)
                .doctorSpecialization(doctorSpecialization)
                .appointmentDateTime(appointment.getAppointmentDateTime())
                .durationMinutes(appointment.getDurationMinutes())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}

package com.pms.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.BasePostgresIntegrationTest;
import com.pms.backend.appointment.dto.AppointmentDto;
import com.pms.backend.appointment.entity.Appointment;
import com.pms.backend.appointment.repository.AppointmentRepository;
import com.pms.backend.auth.service.JwtUtil;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.notification.entity.Notification;
import com.pms.backend.notification.repository.NotificationRepository;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Appointment Lifecycle Integration Test")
class AppointmentLifecycleIntegrationTest extends BasePostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User receptionistUser;
    private User doctorUser;
    private User patientUser;
    private Doctor doctor;
    private Patient patient;
    private String receptionistJwt;

    @BeforeEach
    void setUp() {
        cleanUpDatabase();

        // 1. Create Doctor user & entity
        doctorUser = userRepository.save(User.builder()
                .firstName("Gregory")
                .lastName("House")
                .email("drhouse.lifecycle@hospital.org")
                .mobileNumber("+15551001")
                .role(Role.DOCTOR)
                .isActive(true)
                .passwordHash("hash")
                .build());

        doctor = doctorRepository.save(Doctor.builder()
                .user(doctorUser)
                .specialization("Diagnostics")
                .isAvailable(true)
                .hospital("Princeton Hospital")
                .department("Diagnostics")
                .consultationFee(200.0)
                .build());

        // 2. Create Patient user & entity
        patientUser = userRepository.save(User.builder()
                .firstName("James")
                .lastName("Wilson")
                .email("wilson.patient@hospital.org")
                .mobileNumber("+15551002")
                .role(Role.PATIENT)
                .isActive(true)
                .passwordHash("hash")
                .build());

        patient = patientRepository.save(Patient.builder()
                .user(patientUser)
                .patientId("P-99001")
                .build());

        // 3. Create Receptionist user
        receptionistUser = userRepository.save(User.builder()
                .firstName("Pam")
                .lastName("Beesly")
                .email("pam.receptionist@hospital.org")
                .mobileNumber("+15551003")
                .role(Role.RECEPTIONIST)
                .isActive(true)
                .passwordHash("hash")
                .build());

        receptionistJwt = jwtUtil.generateToken(receptionistUser);
    }

    @AfterEach
    void tearDown() {
        cleanUpDatabase();
    }

    private void cleanUpDatabase() {
        appointmentRepository.deleteAll();
        notificationRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Lifecycle: POST /api/appointments creates appointment and notifies Doctor, Patient, and all Receptionists")
    void testAppointmentLifecycle_CreatesRow_AndDispatchesNotifications() throws Exception {
        String reqJson = String.format("""
                {
                    "patientId": %d,
                    "doctorId": %d,
                    "appointmentDateTime": "2026-10-01T10:00:00",
                    "durationMinutes": 30,
                    "reason": "Follow-up Consultation",
                    "notes": "Patient requested morning slot"
                }
                """, patient.getId(), doctor.getId());

        // 1. POST /api/appointments as RECEPTIONIST
        String responseBody = mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + receptionistJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long createdId = ((Number) com.jayway.jsonpath.JsonPath.read(responseBody, "$.id")).longValue();
        String createdStatus = com.jayway.jsonpath.JsonPath.read(responseBody, "$.status");
        assertThat(createdId).isNotNull();
        assertThat(createdStatus).isEqualTo("PENDING");

        // 2. Verify row persisted via AppointmentRepository
        Appointment persisted = appointmentRepository.findById(createdId).orElse(null);
        assertThat(persisted).isNotNull();
        assertThat(persisted.getPatient().getId()).isEqualTo(patient.getId());
        assertThat(persisted.getDoctor().getId()).isEqualTo(doctor.getId());
        assertThat(persisted.getReason()).isEqualTo("Follow-up Consultation");

        // 3. Verify NotificationService fired to: Doctor, Patient, and Receptionist
        List<Notification> notifications = notificationRepository.findAll();
        assertThat(notifications).hasSize(3);

        // Doctor notification
        Notification doctorNotification = notifications.stream()
                .filter(n -> n.getUserId().equals(doctorUser.getId()))
                .findFirst()
                .orElse(null);
        assertThat(doctorNotification).isNotNull();
        assertThat(doctorNotification.getTitle()).isEqualTo("New Appointment Request");
        assertThat(doctorNotification.getMessage()).contains("James Wilson");

        // Patient notification
        Notification patientNotification = notifications.stream()
                .filter(n -> n.getUserId().equals(patientUser.getId()))
                .findFirst()
                .orElse(null);
        assertThat(patientNotification).isNotNull();
        assertThat(patientNotification.getTitle()).isEqualTo("Appointment Pending");
        assertThat(patientNotification.getMessage()).contains("Dr. Gregory House");

        // Receptionist notification
        Notification receptionistNotification = notifications.stream()
                .filter(n -> n.getUserId().equals(receptionistUser.getId()))
                .findFirst()
                .orElse(null);
        assertThat(receptionistNotification).isNotNull();
        assertThat(receptionistNotification.getTitle()).isEqualTo("New Appointment Request");
        assertThat(receptionistNotification.getMessage()).contains("James Wilson");
    }
}

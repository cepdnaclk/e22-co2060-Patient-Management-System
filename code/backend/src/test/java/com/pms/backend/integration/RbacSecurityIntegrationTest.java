package com.pms.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.BasePostgresIntegrationTest;
import com.pms.backend.auth.service.JwtUtil;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.repository.InvoiceRepository;
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

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("RBAC Security & Filter Level Integration Test")
class RbacSecurityIntegrationTest extends BasePostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private com.pms.backend.audit.repository.AuditLogRepository auditLogRepository;

    private User adminUser;
    private User doctorUser;
    private User patientUser;
    private User billingStaffUser;
    private Invoice invoice;

    private String adminJwt;
    private String doctorJwt;
    private String patientJwt;
    private String billingStaffJwt;

    @BeforeEach
    void setUp() {
        cleanUp();

        adminUser = userRepository.save(User.builder()
                .firstName("Alice")
                .lastName("Admin")
                .email("alice.admin@hospital.local")
                .mobileNumber("+15552001")
                .role(Role.ADMIN)
                .isActive(true)
                .passwordHash("hash")
                .build());
        adminJwt = jwtUtil.generateToken(adminUser);

        doctorUser = userRepository.save(User.builder()
                .firstName("David")
                .lastName("Doctor")
                .email("david.doc@hospital.local")
                .mobileNumber("+15552002")
                .role(Role.DOCTOR)
                .isActive(true)
                .passwordHash("hash")
                .build());
        doctorJwt = jwtUtil.generateToken(doctorUser);

        patientUser = userRepository.save(User.builder()
                .firstName("Penny")
                .lastName("Patient")
                .email("penny.patient@hospital.local")
                .mobileNumber("+15552003")
                .role(Role.PATIENT)
                .isActive(true)
                .passwordHash("hash")
                .build());
        patientJwt = jwtUtil.generateToken(patientUser);

        billingStaffUser = userRepository.save(User.builder()
                .firstName("Bob")
                .lastName("Billing")
                .email("bob.billing@hospital.local")
                .mobileNumber("+15552004")
                .role(Role.BILLING_STAFF)
                .isActive(true)
                .passwordHash("hash")
                .build());
        billingStaffJwt = jwtUtil.generateToken(billingStaffUser);

        Patient patient = patientRepository.save(Patient.builder()
                .user(patientUser)
                .patientId("P-33001")
                .build());

        invoice = invoiceRepository.save(Invoice.builder()
                .invoiceNumber("INV-TEST-001")
                .patient(patient)
                .subtotal(new BigDecimal("100.00"))
                .totalAmount(new BigDecimal("100.00"))
                .paidAmount(BigDecimal.ZERO)
                .status("ISSUED")
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        invoiceRepository.deleteAll();
        patientRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Pattern 1: /api/audit/** -> 200 for ADMIN, 403 for PATIENT")
    void testAuditEndpoint_SecurityFilter() throws Exception {
        // Allowed role (ADMIN) -> 200 OK
        mockMvc.perform(get("/api/audit/logs")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk());

        // Disallowed role (PATIENT) -> 403 FORBIDDEN
        mockMvc.perform(get("/api/audit/logs")
                        .header("Authorization", "Bearer " + patientJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Pattern 2: /api/users/** -> Filter level rejects PATIENT with 403")
    void testUsersEndpoint_SecurityFilter() throws Exception {
        // Disallowed role (PATIENT) -> 403 FORBIDDEN by SecurityConfig filter rule
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + patientJwt))
                .andExpect(status().isForbidden());

        // Also test /api/v1/admin/users
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + patientJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Pattern 3: /api/patients -> 200 for DOCTOR, 403 for PATIENT")
    void testPatientsEndpoint_SecurityFilter() throws Exception {
        // Allowed role (DOCTOR) -> 200 OK
        mockMvc.perform(get("/api/patients")
                        .header("Authorization", "Bearer " + doctorJwt))
                .andExpect(status().isOk());

        // Disallowed role (PATIENT) -> 403 FORBIDDEN
        mockMvc.perform(get("/api/patients")
                        .header("Authorization", "Bearer " + patientJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Pattern 4: /api/invoices/{id}/pay -> 200 for BILLING_STAFF, 403 for DOCTOR")
    void testInvoicePaymentEndpoint_SecurityFilter() throws Exception {
        Map<String, Object> payPayload = Map.of(
                "amount", "50.00",
                "paymentMethod", "CASH"
        );

        // Allowed role (BILLING_STAFF) -> 200 OK
        mockMvc.perform(post("/api/invoices/" + invoice.getId() + "/pay")
                        .header("Authorization", "Bearer " + billingStaffJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payPayload)))
                .andExpect(status().isOk());

        // Disallowed role (DOCTOR) -> 403 FORBIDDEN
        mockMvc.perform(post("/api/invoices/" + invoice.getId() + "/pay")
                        .header("Authorization", "Bearer " + doctorJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payPayload)))
                .andExpect(status().isForbidden());
    }
}

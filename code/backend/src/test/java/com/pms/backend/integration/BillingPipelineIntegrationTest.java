package com.pms.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.BasePostgresIntegrationTest;
import com.pms.backend.auth.service.JwtUtil;
import com.pms.backend.billing.dto.CreateInvoiceRequest;
import com.pms.backend.billing.dto.CreatePendingItemRequest;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.entity.PendingBillItem;
import com.pms.backend.billing.repository.InvoiceRepository;
import com.pms.backend.billing.repository.PendingBillItemRepository;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Billing Pipeline Integration Test")
class BillingPipelineIntegrationTest extends BasePostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PendingBillItemRepository pendingBillItemRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private com.pms.backend.audit.repository.AuditLogRepository auditLogRepository;

    private User pharmacistUser;
    private User billingStaffUser;
    private User patientUser;
    private Patient patient;
    private String pharmacistJwt;
    private String billingStaffJwt;

    @BeforeEach
    void setUp() {
        cleanUp();

        // 1. Create Patient
        patientUser = userRepository.save(User.builder()
                .firstName("Bruce")
                .lastName("Wayne")
                .email("bruce.wayne@wayne.local")
                .mobileNumber("+15558801")
                .role(Role.PATIENT)
                .isActive(true)
                .passwordHash("hash")
                .build());

        patient = patientRepository.save(Patient.builder()
                .user(patientUser)
                .patientId("P-88001")
                .build());

        // 2. Create Pharmacist
        pharmacistUser = userRepository.save(User.builder()
                .firstName("Lucius")
                .lastName("Fox")
                .email("lucius.pharma@wayne.local")
                .mobileNumber("+15558802")
                .role(Role.PHARMACIST)
                .isActive(true)
                .passwordHash("hash")
                .build());
        pharmacistJwt = jwtUtil.generateToken(pharmacistUser);

        // 3. Create Billing Staff
        billingStaffUser = userRepository.save(User.builder()
                .firstName("Alfred")
                .lastName("Pennyworth")
                .email("alfred.billing@wayne.local")
                .mobileNumber("+15558803")
                .role(Role.BILLING_STAFF)
                .isActive(true)
                .passwordHash("hash")
                .build());
        billingStaffJwt = jwtUtil.generateToken(billingStaffUser);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        invoiceRepository.deleteAll();
        pendingBillItemRepository.deleteAll();
        patientRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Pipeline: POST /api/billing/pending-items (PHARMACIST) -> Pending items PENDING -> POST /api/invoices (BILLING_STAFF) -> items flip to BILLED & Invoice total calculated")
    void testBillingPipeline_PharmacistItems_To_BilledInvoice() throws Exception {
        // Step 1: Pharmacist adds pending bill items
        CreatePendingItemRequest item1 = new CreatePendingItemRequest();
        item1.setPatientId(patient.getId());
        item1.setDepartment("PHARMACY");
        item1.setDescription("Amoxicillin 500mg (14 capsules)");
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("25.00")); // Subtotal = 50.00

        CreatePendingItemRequest item2 = new CreatePendingItemRequest();
        item2.setPatientId(patient.getId());
        item2.setDepartment("PHARMACY");
        item2.setDescription("Saline Nasal Spray");
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("15.00")); // Subtotal = 15.00

        mockMvc.perform(post("/api/billing/pending-items")
                        .header("Authorization", "Bearer " + pharmacistJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(item1, item2))))
                .andExpect(status().isOk());

        // Verify PendingBillItem rows created with status PENDING
        List<PendingBillItem> pendingList = pendingBillItemRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patient.getId(), "PENDING");
        assertThat(pendingList).hasSize(2);
        assertThat(pendingList).allMatch(p -> "PENDING".equals(p.getStatus()));

        // Step 2: Billing staff creates an Invoice for that patient
        CreateInvoiceRequest.ItemDto invItem1 = new CreateInvoiceRequest.ItemDto();
        invItem1.setDescription("Amoxicillin 500mg (14 capsules)");
        invItem1.setQuantity(2);
        invItem1.setUnitPrice(new BigDecimal("25.00"));
        invItem1.setItemType("MEDICINE");

        CreateInvoiceRequest.ItemDto invItem2 = new CreateInvoiceRequest.ItemDto();
        invItem2.setDescription("Saline Nasal Spray");
        invItem2.setQuantity(1);
        invItem2.setUnitPrice(new BigDecimal("15.00"));
        invItem2.setItemType("MEDICINE");

        CreateInvoiceRequest invoiceReq = new CreateInvoiceRequest();
        invoiceReq.setPatientId(patient.getId());
        invoiceReq.setItems(List.of(invItem1, invItem2));
        invoiceReq.setDiscount(new BigDecimal("5.00"));
        invoiceReq.setTax(new BigDecimal("6.00")); // Flat tax or amount
        invoiceReq.setPaymentMethod("CASH");
        invoiceReq.setNotes("Pharmacy discharge medications");

        mockMvc.perform(post("/api/invoices")
                        .header("Authorization", "Bearer " + billingStaffJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceReq)))
                .andExpect(status().isCreated())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subtotal").value(65.0))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.discount").value(5.0))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.tax").value(6.0))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.totalAmount").value(66.0))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value("ISSUED"));

        // Step 3: Assert pending bill items flipped to "BILLED"
        List<PendingBillItem> remainingPending = pendingBillItemRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patient.getId(), "PENDING");
        assertThat(remainingPending).isEmpty();

        List<PendingBillItem> billedItems = pendingBillItemRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patient.getId(), "BILLED");
        assertThat(billedItems).hasSize(2);
    }
}

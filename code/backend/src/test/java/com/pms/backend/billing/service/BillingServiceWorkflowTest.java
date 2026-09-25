package com.pms.backend.billing.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.billing.dto.CreateInvoiceRequest;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.repository.InvoiceRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceWorkflowTest {

    @Mock
    private InvoiceRepository invoiceRepo;

    @Mock
    private PatientRepository patientRepo;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private BillingService billingService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateUser() {
        User staff = User.builder().id(99L).email("billing@pms.local").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(staff, null, List.of())
        );
    }

    @Test
    void testCreateInvoice_CalculatesTotalsAccurately() {
        authenticateUser();

        Patient patient = Patient.builder().id(1L).build();
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));

        CreateInvoiceRequest.ItemDto item1 = new CreateInvoiceRequest.ItemDto();
        item1.setDescription("Consultation");
        item1.setQuantity(1);
        item1.setUnitPrice(new BigDecimal("50.00"));
        item1.setItemType("CONSULTATION");

        CreateInvoiceRequest.ItemDto item2 = new CreateInvoiceRequest.ItemDto();
        item2.setDescription("Blood Test");
        item2.setQuantity(2);
        item2.setUnitPrice(new BigDecimal("25.00"));
        item2.setItemType("LAB_TEST");

        CreateInvoiceRequest req = new CreateInvoiceRequest();
        req.setPatientId(1L);
        req.setDiscount(new BigDecimal("10.00"));
        req.setTax(new BigDecimal("5.00"));
        req.setPaymentMethod("CASH");
        req.setItems(List.of(item1, item2));

        when(invoiceRepo.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice invObj = inv.getArgument(0);
            invObj.setId(100L);
            return invObj;
        });

        // Act
        Invoice result = billingService.createInvoice(req);

        // Assert
        assertNotNull(result);
        assertTrue(result.getInvoiceNumber().startsWith("INV-"));
        assertEquals("ISSUED", result.getStatus());
        // Subtotal = 50 + (2 * 25) = 100. Total = 100 - 10 + 5 = 95
        assertEquals(new BigDecimal("100.00"), result.getSubtotal());
        assertEquals(new BigDecimal("95.00"), result.getTotalAmount());
        verify(invoiceRepo, times(1)).save(any(Invoice.class));
    }

    @Test
    void testRecordPayment_PartialPayment_SetsStatusPartiallyPaid() {
        authenticateUser();

        Invoice invoice = Invoice.builder()
                .id(10L)
                .totalAmount(new BigDecimal("100.00"))
                .paidAmount(BigDecimal.ZERO)
                .status("ISSUED")
                .items(new ArrayList<>())
                .build();
        when(invoiceRepo.findById(10L)).thenReturn(Optional.of(invoice));
        when(invoiceRepo.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Invoice updated = billingService.recordPayment(10L, new BigDecimal("40.00"), "CARD");

        assertEquals(new BigDecimal("40.00"), updated.getPaidAmount());
        assertEquals("PARTIALLY_PAID", updated.getStatus());
        assertNull(updated.getPaidAt());
        verify(invoiceRepo, times(1)).save(invoice);
    }

    @Test
    void testRecordPayment_FullPayment_SetsStatusPaidAndPaidAt() {
        authenticateUser();

        Invoice invoice = Invoice.builder()
                .id(10L)
                .totalAmount(new BigDecimal("100.00"))
                .paidAmount(new BigDecimal("40.00"))
                .status("PARTIALLY_PAID")
                .items(new ArrayList<>())
                .build();
        when(invoiceRepo.findById(10L)).thenReturn(Optional.of(invoice));
        when(invoiceRepo.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Invoice updated = billingService.recordPayment(10L, new BigDecimal("60.00"), "CASH");

        assertEquals(new BigDecimal("100.00"), updated.getPaidAmount());
        assertEquals("PAID", updated.getStatus());
        assertNotNull(updated.getPaidAt());
    }

    @Test
    void testRecordPayment_AlreadyPaid_ThrowsConflict() {
        Invoice invoice = Invoice.builder()
                .id(10L)
                .status("PAID")
                .build();
        when(invoiceRepo.findById(10L)).thenReturn(Optional.of(invoice));

        AppException exception = assertThrows(AppException.class, () -> {
            billingService.recordPayment(10L, new BigDecimal("20.00"), "CASH");
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Invoice is already paid", exception.getMessage());
        verify(invoiceRepo, never()).save(any());
    }

    @Test
    void testGetSummary_ReconcilesRevenue() {
        when(invoiceRepo.getTotalRevenue()).thenReturn(new BigDecimal("15450.75"));
        when(invoiceRepo.countCompletedInvoices()).thenReturn(14L);

        BigDecimal revenue = billingService.getTotalRevenue();
        long completed = billingService.getCompletedCount();

        assertEquals(new BigDecimal("15450.75"), revenue);
        assertEquals(14L, completed);
    }
}

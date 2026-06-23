package com.pms.backend.billing.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.billing.dto.CreateInvoiceRequest;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.entity.InvoiceItem;
import com.pms.backend.billing.repository.InvoiceRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final PatientRepository patientRepo;
    private final AuditLogService   auditLogService;

    // Thread-safe counter for generating invoice numbers
    private final AtomicLong invoiceCounter = new AtomicLong(1000);

    // ── CREATE INVOICE ───────────────────────────────────────────────────────
    @Transactional
    public Invoice createInvoice(CreateInvoiceRequest req) {
        Patient patient = patientRepo.findById(req.getPatientId())
                .orElseThrow(() -> AppException.notFound("Patient not found"));

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .patient(patient)
                .createdBy(currentUser)
                .status("ISSUED")
                .paymentMethod(req.getPaymentMethod())
                .discount(req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO)
                .tax(req.getTax() != null ? req.getTax() : BigDecimal.ZERO)
                .notes(req.getNotes())
                .issuedAt(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(7))
                .build();

        // Build line items
        List<InvoiceItem> items = req.getItems().stream().map(dto -> {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .totalPrice(dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())))
                    .itemType(dto.getItemType())
                    .build();
            return item;
        }).toList();

        invoice.getItems().addAll(items);
        invoice.recalculateTotal();

        Invoice saved = invoiceRepo.save(invoice);

        auditLogService.log(currentUser.getId(), currentUser.getEmail(),
                "CREATE_INVOICE", "Invoice", saved.getId().toString(),
                "Invoice " + invoiceNumber + " for patient " + patient.getId(), null);

        return saved;
    }

    // ── RECORD PAYMENT ────────────────────────────────────────────────────────
    @Transactional
    public Invoice recordPayment(Long invoiceId, BigDecimal amount, String paymentMethod) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> AppException.notFound("Invoice not found"));

        if ("PAID".equals(invoice.getStatus()) || "CANCELLED".equals(invoice.getStatus())) {
            throw AppException.conflict("Invoice is already " + invoice.getStatus().toLowerCase());
        }

        BigDecimal newPaid = invoice.getPaidAmount().add(amount);
        invoice.setPaidAmount(newPaid);
        invoice.setPaymentMethod(paymentMethod);

        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
            invoice.setPaidAt(LocalDateTime.now());
        } else {
            invoice.setStatus("PARTIALLY_PAID");
        }

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        auditLogService.log(currentUser.getId(), currentUser.getEmail(),
                "RECORD_PAYMENT", "Invoice", invoice.getId().toString(),
                "Payment of " + amount + " recorded. Status: " + invoice.getStatus(), null);

        return invoiceRepo.save(invoice);
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    public Invoice getById(Long id) {
        return invoiceRepo.findById(id)
                .orElseThrow(() -> AppException.notFound("Invoice not found"));
    }

    // ── GET BY PATIENT ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<Invoice> getByPatient(Long patientId, Pageable pageable) {
        return invoiceRepo.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepo.findAll(pageable);
    }

    // ── REVENUE SUMMARY ───────────────────────────────────────────────────────
    public BigDecimal getTotalRevenue() {
        BigDecimal total = invoiceRepo.getTotalRevenue();
        return total != null ? total : BigDecimal.ZERO;
    }

    public long getOutstandingCount() {
        return invoiceRepo.countOutstandingInvoices();
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────
    private String generateInvoiceNumber() {
        String year  = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        String seq   = String.format("%05d", invoiceCounter.getAndIncrement());
        return "INV-" + year + "-" + seq;
    }
}

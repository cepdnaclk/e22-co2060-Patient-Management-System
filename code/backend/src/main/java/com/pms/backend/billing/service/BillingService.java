package com.pms.backend.billing.service;

import com.pms.backend.audit.service.AuditLogService;
import com.pms.backend.billing.dto.CreateInvoiceRequest;
import com.pms.backend.billing.dto.CreatePendingItemRequest;
import com.pms.backend.billing.dto.PendingBillItemDto;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.entity.InvoiceItem;
import com.pms.backend.billing.entity.PendingBillItem;
import com.pms.backend.billing.repository.InvoiceRepository;
import com.pms.backend.billing.repository.PendingBillItemRepository;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;
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
    private final PendingBillItemRepository pendingBillItemRepo;
    private final PatientRepository patientRepo;
    private final AuditLogService   auditLogService;

    // Thread-safe counter for generating invoice numbers
    private final AtomicLong invoiceCounter = new AtomicLong(1000);

    @PostConstruct
    public void init() {
        Long maxId = invoiceRepo.getMaxId();
        if (maxId != null) {
            invoiceCounter.set(1000 + maxId);
        }
    }

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
        
        // Mark pending items as BILLED if they match the patient
        List<PendingBillItem> pendingItems = pendingBillItemRepo.findByPatientIdAndStatusOrderByCreatedAtDesc(patient.getId(), "PENDING");
        for (PendingBillItem p : pendingItems) {
            p.setStatus("BILLED");
            pendingBillItemRepo.save(p);
        }

        auditLogService.log(currentUser.getId(), currentUser.getEmail(),
                "CREATE_INVOICE", "Invoice", saved.getId().toString(),
                "Invoice " + invoiceNumber + " for patient " + patient.getId(), null);

        return saved;
    }

    // ── PENDING BILL ITEMS ────────────────────────────────────────────────────
    @Transactional
    public List<PendingBillItemDto> addPendingItems(List<CreatePendingItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        
        List<PendingBillItem> savedItems = requests.stream().map(req -> {
            Patient patient = patientRepo.findById(req.getPatientId())
                    .orElseThrow(() -> AppException.notFound("Patient not found"));

            PendingBillItem item = PendingBillItem.builder()
                    .patient(patient)
                    .department(req.getDepartment())
                    .description(req.getDescription())
                    .quantity(req.getQuantity())
                    .unitPrice(req.getUnitPrice())
                    .status("PENDING")
                    .build();
            return pendingBillItemRepo.save(item);
        }).toList();

        return savedItems.stream().map(this::mapToPendingDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PendingBillItemDto> getPendingItemsByPatient(Long patientId) {
        return pendingBillItemRepo.findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, "PENDING")
                .stream().map(this::mapToPendingDto).toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getPatientsWithPendingItems() {
        return pendingBillItemRepo.findDistinctPatientIdsWithPendingItems();
    }
    
    private PendingBillItemDto mapToPendingDto(PendingBillItem entity) {
        PendingBillItemDto dto = new PendingBillItemDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatient().getId());
        dto.setDepartment(entity.getDepartment());
        dto.setDescription(entity.getDescription());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setTotalPrice(entity.getTotalPrice());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
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

    public long getCompletedCount() {
        return invoiceRepo.countCompletedInvoices();
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────
    private String generateInvoiceNumber() {
        String year  = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        String seq   = String.format("%05d", invoiceCounter.getAndIncrement());
        return "INV-" + year + "-" + seq;
    }
}

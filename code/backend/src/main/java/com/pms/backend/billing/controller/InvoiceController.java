package com.pms.backend.billing.controller;

import com.pms.backend.billing.dto.CreateInvoiceRequest;
import com.pms.backend.billing.entity.Invoice;
import com.pms.backend.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final BillingService billingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF','RECEPTIONIST')")
    public ResponseEntity<Invoice> create(@RequestBody CreateInvoiceRequest req) {
        return ResponseEntity.status(201).body(billingService.createInvoice(req));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF','DOCTOR','RECEPTIONIST','PATIENT')")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getById(id));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF','RECEPTIONIST')")
    public ResponseEntity<Invoice> recordPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String method = body.getOrDefault("paymentMethod", "CASH").toString();
        return ResponseEntity.ok(billingService.recordPayment(id, amount, method));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF','DOCTOR','PATIENT')")
    public ResponseEntity<Page<Invoice>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(billingService.getByPatient(patientId, pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF','RECEPTIONIST')")
    public ResponseEntity<Page<Invoice>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(billingService.getAllInvoices(pageable));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','BILLING_STAFF')")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(Map.of(
                "totalRevenue",       billingService.getTotalRevenue(),
                "outstandingInvoices", billingService.getOutstandingCount()
        ));
    }
}

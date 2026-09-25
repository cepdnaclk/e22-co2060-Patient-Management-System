package com.pms.backend.billing.controller;

import com.pms.backend.billing.dto.CreatePendingItemRequest;
import com.pms.backend.billing.dto.PendingBillItemDto;
import com.pms.backend.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing/pending-items")
@RequiredArgsConstructor
public class PendingBillItemController {

    private final BillingService billingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','PHARMACIST','LAB_TECHNICIAN','RECEPTIONIST')")
    public ResponseEntity<List<PendingBillItemDto>> addPendingItems(@RequestBody List<CreatePendingItemRequest> requests) {
        return ResponseEntity.ok(billingService.addPendingItems(requests));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECEPTIONIST','BILLING_STAFF')")
    public ResponseEntity<List<Long>> getPatientsWithPendingItems() {
        return ResponseEntity.ok(billingService.getPatientsWithPendingItems());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECEPTIONIST','BILLING_STAFF')")
    public ResponseEntity<List<PendingBillItemDto>> getPendingItemsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(billingService.getPendingItemsByPatient(patientId));
    }
}

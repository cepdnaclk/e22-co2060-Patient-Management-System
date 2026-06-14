package com.pms.backend.pharmacy.controller;

import com.pms.backend.pharmacy.dto.MedicineDto;
import com.pms.backend.pharmacy.entity.Medicine;
import com.pms.backend.pharmacy.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy/medicines")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR')")
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(pharmacyService.getAllMedicines());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Medicine>> getLowStockMedicines() {
        return ResponseEntity.ok(pharmacyService.getLowStockMedicines());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PHARMACIST')")
    public ResponseEntity<Medicine> addMedicine(@RequestBody MedicineDto medicineDto) {
        return new ResponseEntity<>(pharmacyService.addMedicine(medicineDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PHARMACIST')")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody MedicineDto medicineDto) {
        return ResponseEntity.ok(pharmacyService.updateMedicine(id, medicineDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PHARMACIST')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        pharmacyService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}

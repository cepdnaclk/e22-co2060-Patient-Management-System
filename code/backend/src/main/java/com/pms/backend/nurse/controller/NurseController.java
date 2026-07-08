package com.pms.backend.nurse.controller;

import com.pms.backend.nurse.dto.ClinicalOrderDto;
import com.pms.backend.nurse.dto.MedAdministrationDto;
import com.pms.backend.nurse.dto.MedicationOrderDto;
import com.pms.backend.nurse.dto.VitalsRecordDto;
import com.pms.backend.nurse.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nurse")
@RequiredArgsConstructor
public class NurseController {

    private final NurseService nurseService;

    // --- VITALS ---

    @GetMapping("/vitals/patient/{patientId}")
    @PreAuthorize("hasRole('NURSE') or hasRole('DOCTOR')")
    public ResponseEntity<List<VitalsRecordDto>> getPatientVitals(@PathVariable Long patientId) {
        return ResponseEntity.ok(nurseService.getPatientVitals(patientId));
    }

    @PostMapping("/vitals")
    @PreAuthorize("hasRole('NURSE') or hasRole('DOCTOR')")
    public ResponseEntity<VitalsRecordDto> recordVitals(@RequestBody VitalsRecordDto dto) {
        return ResponseEntity.ok(nurseService.recordVitals(dto));
    }

    // --- MAR ---

    @GetMapping("/medications/patient/{patientId}")
    @PreAuthorize("hasRole('NURSE') or hasRole('DOCTOR')")
    public ResponseEntity<List<MedicationOrderDto>> getPatientMedications(@PathVariable Long patientId) {
        return ResponseEntity.ok(nurseService.getPatientMedicationOrders(patientId));
    }

    @PostMapping("/medications")
    @PreAuthorize("hasRole('NURSE') or hasRole('DOCTOR')")
    public ResponseEntity<MedicationOrderDto> createMedicationOrder(@RequestBody MedicationOrderDto dto) {
        return ResponseEntity.ok(nurseService.createMedicationOrder(dto));
    }

    @PostMapping("/medications/administer")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<MedAdministrationDto> administerMedication(@RequestBody MedAdministrationDto dto) {
        return ResponseEntity.ok(nurseService.administerMedication(dto));
    }

    // --- CLINICAL ORDERS ---

    @GetMapping("/orders/patient/{patientId}")
    @PreAuthorize("hasRole('NURSE') or hasRole('DOCTOR')")
    public ResponseEntity<List<ClinicalOrderDto>> getPatientClinicalOrders(@PathVariable Long patientId) {
        return ResponseEntity.ok(nurseService.getPatientClinicalOrders(patientId));
    }

    @PutMapping("/orders/{orderId}/complete")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<ClinicalOrderDto> completeClinicalOrder(
            @PathVariable Long orderId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(nurseService.completeClinicalOrder(orderId, userId));
    }
}

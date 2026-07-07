package com.pms.backend.patient.controller;

import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('PATIENT')")
    public ResponseEntity<PatientDto> createPatient(@RequestParam Long userId, @RequestBody PatientDto patientDto) {
        PatientDto createdPatient = patientService.createPatient(userId, patientDto);
        return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('RECEPTIONIST') or hasRole('BILLING_STAFF') or hasRole('NURSE')")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('RECEPTIONIST') or hasRole('BILLING_STAFF')")
    public ResponseEntity<PatientDto> getPatientByUserId(@PathVariable Long userId) {
        PatientDto patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('BILLING_STAFF') or hasRole('NURSE')")
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        List<PatientDto> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('NURSE')")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @RequestBody PatientDto patientDto) {
        PatientDto updatedPatient = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}


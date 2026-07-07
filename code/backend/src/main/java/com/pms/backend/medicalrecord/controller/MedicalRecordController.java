package com.pms.backend.medicalrecord.controller;

import com.pms.backend.medicalrecord.dto.MedicalRecordDto;
import com.pms.backend.medicalrecord.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('NURSE')")
    public ResponseEntity<MedicalRecordDto> createMedicalRecord(@RequestBody MedicalRecordDto medicalRecordDto) {
        MedicalRecordDto createdRecord = medicalRecordService.createMedicalRecord(medicalRecordDto);
        return new ResponseEntity<>(createdRecord, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('NURSE')")
    public ResponseEntity<MedicalRecordDto> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordDto record = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(record);
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecordDto>> getAllMedicalRecords() {
        List<MedicalRecordDto> records = medicalRecordService.getAllMedicalRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('NURSE')")
    public ResponseEntity<List<MedicalRecordDto>> getMedicalRecordsByPatientId(@PathVariable Long patientId) {
        List<MedicalRecordDto> records = medicalRecordService.getMedicalRecordsByPatientId(patientId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<MedicalRecordDto>> getMedicalRecordsByDoctorId(@PathVariable Long doctorId) {
        List<MedicalRecordDto> records = medicalRecordService.getMedicalRecordsByDoctorId(doctorId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/type/{recordType}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('PHARMACIST')")
    public ResponseEntity<List<MedicalRecordDto>> getMedicalRecordsByRecordType(@PathVariable String recordType) {
        List<MedicalRecordDto> records = medicalRecordService.getMedicalRecordsByRecordType(recordType);
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{id}/fulfill")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('PHARMACIST')")
    public ResponseEntity<MedicalRecordDto> fulfillPrescription(@PathVariable Long id) {
        MedicalRecordDto updatedRecord = medicalRecordService.fulfillPrescription(id);
        return ResponseEntity.ok(updatedRecord);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordDto> updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecordDto medicalRecordDto) {
        MedicalRecordDto updatedRecord = medicalRecordService.updateMedicalRecord(id, medicalRecordDto);
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
}


package com.pms.backend.doctor.controller;

import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> createDoctor(@RequestParam Long userId, @RequestBody DoctorDto doctorDto) {
        DoctorDto createdDoctor = doctorService.createDoctor(userId, doctorDto);
        return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> getDoctorByUserId(@PathVariable Long userId) {
        DoctorDto doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        List<DoctorDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/specialization/{specialization}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<DoctorDto>> getDoctorsBySpecialization(@PathVariable String specialization) {
        List<DoctorDto> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/available")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<DoctorDto>> getAvailableDoctors() {
        List<DoctorDto> doctors = doctorService.getAvailableDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> updateDoctor(@PathVariable Long id, @RequestBody DoctorDto doctorDto) {
        DoctorDto updatedDoctor = doctorService.updateDoctor(id, doctorDto);
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}


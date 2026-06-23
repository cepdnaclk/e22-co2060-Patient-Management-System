package com.pms.backend.patient.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientDto createPatient(Long userId, PatientDto patientDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (patientRepository.existsByUserId(userId)) {
            throw new AppException("Patient profile already exists for this user", HttpStatus.CONFLICT);
        }

        Patient patient = Patient.builder()
                .user(user)
            .patientId(patientDto.getPatientId())
            .address(patientDto.getAddress())
                .dateOfBirth(patientDto.getDateOfBirth())
                .gender(patientDto.getGender())
                .bloodType(patientDto.getBloodType())
            .bloodPressure(patientDto.getBloodPressure())
            .heartRate(patientDto.getHeartRate())
            .temperature(patientDto.getTemperature())
            .oxygenSaturation(patientDto.getOxygenSaturation())
            .respiratoryRate(patientDto.getRespiratoryRate())
            .height(patientDto.getHeight())
            .weight(patientDto.getWeight())
            .lastVitalsUpdate(patientDto.getLastVitalsUpdate())
            .admissionDate(patientDto.getAdmissionDate())
            .admissionReason(patientDto.getAdmissionReason())
            .admissionStatus(patientDto.getAdmissionStatus())
            .dischargeDate(patientDto.getDischargeDate())
            .primaryDoctor(patientDto.getPrimaryDoctor())
                .emergencyContactName(patientDto.getEmergencyContactName())
                .emergencyContactPhone(patientDto.getEmergencyContactPhone())
            .emergencyContactRelation(patientDto.getEmergencyContactRelation())
                .medicalHistory(patientDto.getMedicalHistory())
                .allergies(patientDto.getAllergies())
                .currentMedications(patientDto.getCurrentMedications())
                .criticalStatus(patientDto.getCriticalStatus() != null ? patientDto.getCriticalStatus() : false)
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return convertToDto(savedPatient);
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));
        return convertToDto(patient);
    }

    public PatientDto getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Patient profile not found", HttpStatus.NOT_FOUND));
        return convertToDto(patient);
    }

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PatientDto updatePatient(Long id, PatientDto patientDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));

        if (patientDto.getPatientId() != null) {
            patient.setPatientId(patientDto.getPatientId());
        }
        if (patientDto.getAddress() != null) {
            patient.setAddress(patientDto.getAddress());
        }
        if (patientDto.getDateOfBirth() != null) {
            patient.setDateOfBirth(patientDto.getDateOfBirth());
        }
        if (patientDto.getGender() != null) {
            patient.setGender(patientDto.getGender());
        }
        if (patientDto.getBloodType() != null) {
            patient.setBloodType(patientDto.getBloodType());
        }
        if (patientDto.getBloodPressure() != null) {
            patient.setBloodPressure(patientDto.getBloodPressure());
        }
        if (patientDto.getHeartRate() != null) {
            patient.setHeartRate(patientDto.getHeartRate());
        }
        if (patientDto.getTemperature() != null) {
            patient.setTemperature(patientDto.getTemperature());
        }
        if (patientDto.getOxygenSaturation() != null) {
            patient.setOxygenSaturation(patientDto.getOxygenSaturation());
        }
        if (patientDto.getRespiratoryRate() != null) {
            patient.setRespiratoryRate(patientDto.getRespiratoryRate());
        }
        if (patientDto.getHeight() != null) {
            patient.setHeight(patientDto.getHeight());
        }
        if (patientDto.getWeight() != null) {
            patient.setWeight(patientDto.getWeight());
        }
        if (patientDto.getLastVitalsUpdate() != null) {
            patient.setLastVitalsUpdate(patientDto.getLastVitalsUpdate());
        }
        if (patientDto.getAdmissionDate() != null) {
            patient.setAdmissionDate(patientDto.getAdmissionDate());
        }
        if (patientDto.getAdmissionReason() != null) {
            patient.setAdmissionReason(patientDto.getAdmissionReason());
        }
        if (patientDto.getAdmissionStatus() != null) {
            patient.setAdmissionStatus(patientDto.getAdmissionStatus());
        }
        if (patientDto.getDischargeDate() != null) {
            patient.setDischargeDate(patientDto.getDischargeDate());
        }
        if (patientDto.getPrimaryDoctor() != null) {
            patient.setPrimaryDoctor(patientDto.getPrimaryDoctor());
        }
        if (patientDto.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(patientDto.getEmergencyContactName());
        }
        if (patientDto.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(patientDto.getEmergencyContactPhone());
        }
        if (patientDto.getEmergencyContactRelation() != null) {
            patient.setEmergencyContactRelation(patientDto.getEmergencyContactRelation());
        }
        if (patientDto.getMedicalHistory() != null) {
            patient.setMedicalHistory(patientDto.getMedicalHistory());
        }
        if (patientDto.getAllergies() != null) {
            patient.setAllergies(patientDto.getAllergies());
        }
        if (patientDto.getCurrentMedications() != null) {
            patient.setCurrentMedications(patientDto.getCurrentMedications());
        }
        if (patientDto.getCriticalStatus() != null) {
            patient.setCriticalStatus(patientDto.getCriticalStatus());
        }

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDto(updatedPatient);
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));
        patientRepository.delete(patient);
    }

    private PatientDto convertToDto(Patient patient) {
        return PatientDto.builder()
                .id(patient.getId())
            .patientId(patient.getPatientId())
                .userId(patient.getUser().getId())
                .firstName(patient.getUser().getFirstName())
                .lastName(patient.getUser().getLastName())
                .email(patient.getUser().getEmail())
            .address(patient.getAddress())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodType(patient.getBloodType())
            .bloodPressure(patient.getBloodPressure())
            .heartRate(patient.getHeartRate())
            .temperature(patient.getTemperature())
            .oxygenSaturation(patient.getOxygenSaturation())
            .respiratoryRate(patient.getRespiratoryRate())
            .height(patient.getHeight())
            .weight(patient.getWeight())
            .lastVitalsUpdate(patient.getLastVitalsUpdate())
            .admissionDate(patient.getAdmissionDate())
            .admissionReason(patient.getAdmissionReason())
            .admissionStatus(patient.getAdmissionStatus())
            .dischargeDate(patient.getDischargeDate())
            .primaryDoctor(patient.getPrimaryDoctor())
                .mobileNumber(patient.getUser().getMobileNumber())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
            .emergencyContactRelation(patient.getEmergencyContactRelation())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .currentMedications(patient.getCurrentMedications())
                .criticalStatus(patient.getCriticalStatus())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .build();
    }
}


package com.pms.backend.medicalrecord.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.medicalrecord.dto.MedicalRecordDto;
import com.pms.backend.medicalrecord.entity.MedicalRecord;
import com.pms.backend.medicalrecord.repository.MedicalRecordRepository;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public MedicalRecordDto createMedicalRecord(MedicalRecordDto medicalRecordDto) {
        Patient patient = patientRepository.findById(medicalRecordDto.getPatientId())
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));

        Doctor doctor = null;
        if (medicalRecordDto.getDoctorId() != null) {
            doctor = doctorRepository.findByUserId(medicalRecordDto.getDoctorId())
                    .orElse(null);
        }

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .recordType(medicalRecordDto.getRecordType())
                .description(medicalRecordDto.getDescription())
                .diagnosis(medicalRecordDto.getDiagnosis())
                .treatment(medicalRecordDto.getTreatment())
                .testName(medicalRecordDto.getTestName())
                .testResult(medicalRecordDto.getTestResult())
                .attachmentUrl(medicalRecordDto.getAttachmentUrl())
                .isFulfilled(false)
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        return convertToDto(savedRecord);
    }

    public MedicalRecordDto getMedicalRecordById(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException("Medical record not found", HttpStatus.NOT_FOUND));
        return convertToDto(medicalRecord);
    }

    public List<MedicalRecordDto> getMedicalRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDto> getMedicalRecordsByDoctorId(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDto> getMedicalRecordsByRecordType(String recordType) {
        return medicalRecordRepository.findByRecordType(recordType).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDto> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public MedicalRecordDto updateMedicalRecord(Long id, MedicalRecordDto medicalRecordDto) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException("Medical record not found", HttpStatus.NOT_FOUND));

        if (medicalRecordDto.getRecordType() != null) {
            medicalRecord.setRecordType(medicalRecordDto.getRecordType());
        }
        if (medicalRecordDto.getDescription() != null) {
            medicalRecord.setDescription(medicalRecordDto.getDescription());
        }
        if (medicalRecordDto.getDiagnosis() != null) {
            medicalRecord.setDiagnosis(medicalRecordDto.getDiagnosis());
        }
        if (medicalRecordDto.getTreatment() != null) {
            medicalRecord.setTreatment(medicalRecordDto.getTreatment());
        }
        if (medicalRecordDto.getTestName() != null) {
            medicalRecord.setTestName(medicalRecordDto.getTestName());
        }
        if (medicalRecordDto.getTestResult() != null) {
            medicalRecord.setTestResult(medicalRecordDto.getTestResult());
        }
        if (medicalRecordDto.getAttachmentUrl() != null) {
            medicalRecord.setAttachmentUrl(medicalRecordDto.getAttachmentUrl());
        }

        MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);
        return convertToDto(updatedRecord);
    }

    public void deleteMedicalRecord(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException("Medical record not found", HttpStatus.NOT_FOUND));
        medicalRecordRepository.delete(medicalRecord);
    }

    public MedicalRecordDto fulfillPrescription(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException("Medical record not found", HttpStatus.NOT_FOUND));

        if (!"PRESCRIPTION".equalsIgnoreCase(medicalRecord.getRecordType())) {
            throw new AppException("Only prescriptions can be fulfilled", HttpStatus.BAD_REQUEST);
        }

        medicalRecord.setIsFulfilled(true);
        MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);
        return convertToDto(updatedRecord);
    }

    private MedicalRecordDto convertToDto(MedicalRecord medicalRecord) {
        return MedicalRecordDto.builder()
                .id(medicalRecord.getId())
                .patientId(medicalRecord.getPatient().getId())
                .patientName(medicalRecord.getPatient().getUser().getFirstName() + " " + medicalRecord.getPatient().getUser().getLastName())
                .doctorId(medicalRecord.getDoctor() != null ? medicalRecord.getDoctor().getId() : null)
                .doctorName(medicalRecord.getDoctor() != null ? medicalRecord.getDoctor().getUser().getFirstName() + " " + medicalRecord.getDoctor().getUser().getLastName() : null)
                .recordType(medicalRecord.getRecordType())
                .description(medicalRecord.getDescription())
                .diagnosis(medicalRecord.getDiagnosis())
                .treatment(medicalRecord.getTreatment())
                .testName(medicalRecord.getTestName())
                .testResult(medicalRecord.getTestResult())
                .attachmentUrl(medicalRecord.getAttachmentUrl())
                .isFulfilled(medicalRecord.getIsFulfilled())
                .createdAt(medicalRecord.getCreatedAt())
                .updatedAt(medicalRecord.getUpdatedAt())
                .build();
    }
}


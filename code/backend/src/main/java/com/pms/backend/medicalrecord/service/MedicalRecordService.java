package com.pms.backend.medicalrecord.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.medicalrecord.dto.MedicalRecordDto;
import com.pms.backend.medicalrecord.entity.MedicalRecord;
import com.pms.backend.medicalrecord.repository.MedicalRecordRepository;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
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
    private final NotificationService notificationService;
    private final UserRepository userRepository;

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
        
        // Notify the doctor if a lab report is created/uploaded
        if ("LAB_REPORT".equalsIgnoreCase(savedRecord.getRecordType()) && doctor != null) {
            notificationService.createNotification(
                    doctor.getUser().getId(),
                    "New Lab Report",
                    "A new lab report has been uploaded for patient " + patient.getUser().getFirstName() + " " + patient.getUser().getLastName(),
                    NotificationType.LAB_RESULT,
                    savedRecord.getId()
            );
        }

        // Notify all lab technicians if a lab test is ordered
        if ("LAB_TEST".equalsIgnoreCase(savedRecord.getRecordType())) {
            List<User> labTechs = userRepository.findByRoleAndIsActive(Role.LAB_TECHNICIAN, true);
            String doctorName = doctor != null ? "Dr. " + doctor.getUser().getFirstName() : "A doctor";
            for (User tech : labTechs) {
                notificationService.createNotification(
                        tech.getId(),
                        "New Lab Test Ordered",
                        doctorName + " has ordered a new lab test for patient " + patient.getUser().getFirstName() + " " + patient.getUser().getLastName(),
                        NotificationType.SYSTEM_ALERT,
                        savedRecord.getId()
                );
            }
        }

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
        if (medicalRecordDto.getIsFulfilled() != null) {
            medicalRecord.setIsFulfilled(medicalRecordDto.getIsFulfilled());
        }

        MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);

        // Notify doctor if test results/attachments are updated for a LAB_REPORT
        if ("LAB_REPORT".equalsIgnoreCase(updatedRecord.getRecordType()) && updatedRecord.getDoctor() != null) {
            notificationService.createNotification(
                    updatedRecord.getDoctor().getUser().getId(),
                    "Lab Report Updated",
                    "The lab report for patient " + updatedRecord.getPatient().getUser().getFirstName() + " has been updated with results.",
                    NotificationType.LAB_RESULT,
                    updatedRecord.getId()
            );
        }

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


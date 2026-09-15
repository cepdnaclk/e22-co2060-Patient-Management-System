package com.pms.backend.patient.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.patient.dto.PatientDto;
import com.pms.backend.patient.dto.PatientRegistrationRequest;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public PatientDto registerPatient(PatientRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("This email is already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new AppException("This mobile number is already registered", HttpStatus.CONFLICT);
        }

        // SECURITY FIX: Generate a random temporary password instead of using a hardcoded one.
        // Before: passwordEncoder.encode("P@tient@123") ← Every patient got the SAME password!
        // After:  Each patient gets a unique random password. They must use "Forgot Password"
        //         or be given the temp password by the staff member who registered them.
        // See: docs/learning/02-security-password-handling.md
        String tempPassword = UUID.randomUUID().toString().substring(0, 12);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .role(Role.PATIENT)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(savedUser)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodType(request.getBloodType())
                .address(request.getAddress())
                .admissionStatus("Registered")
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelation(request.getEmergencyContactRelation())
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return convertToDto(savedPatient);
    }

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

    // DATA INTEGRITY FIX: Added @Transactional and User field updates.
    // Before: Only Patient fields were updated. User fields (name, email, phone) were silently ignored.
    // After:  Both Patient AND User entities are updated in a single transaction.
    // See: docs/learning/05-entity-relationships-jpa.md
    @Transactional
    public PatientDto updatePatient(Long id, PatientDto patientDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));

        // ── Update linked User fields (name, email, mobile) ──────────────
        User user = patient.getUser();
        boolean userChanged = false;

        if (patientDto.getFirstName() != null && !patientDto.getFirstName().equals(user.getFirstName())) {
            user.setFirstName(patientDto.getFirstName());
            userChanged = true;
        }
        if (patientDto.getLastName() != null && !patientDto.getLastName().equals(user.getLastName())) {
            user.setLastName(patientDto.getLastName());
            userChanged = true;
        }
        if (patientDto.getEmail() != null && !patientDto.getEmail().equals(user.getEmail())) {
            // Check for duplicate email before allowing change
            if (userRepository.existsByEmail(patientDto.getEmail())) {
                throw new AppException("This email is already registered", HttpStatus.CONFLICT);
            }
            user.setEmail(patientDto.getEmail());
            userChanged = true;
        }
        if (patientDto.getMobileNumber() != null && !patientDto.getMobileNumber().equals(user.getMobileNumber())) {
            // Check for duplicate mobile before allowing change
            if (userRepository.existsByMobileNumber(patientDto.getMobileNumber())) {
                throw new AppException("This mobile number is already registered", HttpStatus.CONFLICT);
            }
            user.setMobileNumber(patientDto.getMobileNumber());
            userChanged = true;
        }
        if (userChanged) {
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }

        // ── Update Patient-specific fields ───────────────────────────────
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
            boolean wasAlreadyCritical = Boolean.TRUE.equals(patient.getCriticalStatus());
            patient.setCriticalStatus(patientDto.getCriticalStatus());

            // Notify all active doctors when a patient is flagged as critical
            if (patientDto.getCriticalStatus() && !wasAlreadyCritical) {
                String patientFullName = patient.getUser().getFirstName() + " " + patient.getUser().getLastName();
                userRepository.findByRoleAndIsActive(Role.DOCTOR, true).forEach(doc ->
                    notificationService.createNotification(
                            doc.getId(),
                            "⚠️ Critical Patient Alert",
                            "Patient " + patientFullName + " has been flagged as CRITICAL. Immediate attention required.",
                            NotificationType.CRITICAL_ALERT,
                            patient.getId()
                    )
                );
            }
        }

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDto(updatedPatient);
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException("Patient not found", HttpStatus.NOT_FOUND));
        patientRepository.delete(patient);
    }

    @Transactional
    public PatientDto createPatientFromUser(User user) {
        if (patientRepository.existsByUserId(user.getId())) {
            throw new AppException("Patient profile already exists for this user", HttpStatus.CONFLICT);
        }

        Patient patient = Patient.builder()
                .user(user)
                .admissionStatus("Registered")
                .build();

        Patient saved = patientRepository.save(patient);

        String generatedId = "P-" + String.format("%05d", saved.getId());
        saved.setPatientId(generatedId);
        saved.setUpdatedAt(LocalDateTime.now());
        patientRepository.save(saved);

        return convertToDto(saved);
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


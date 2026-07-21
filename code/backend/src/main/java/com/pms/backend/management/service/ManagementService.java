package com.pms.backend.management.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.management.dto.ManagementUpdateDoctorRequest;
import com.pms.backend.management.dto.ManagementUpdateUserRequest;
import com.pms.backend.management.entity.ManagementActivityLog;
import com.pms.backend.management.repository.ManagementActivityLogRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.dto.UserDto;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManagementService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final ManagementActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto updateUser(Long userId, ManagementUpdateUserRequest req) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User not found"));

        validateTargetRole(targetUser.getRole(), "modify");
        if (req.getRole() != null) {
            validateTargetRole(req.getRole(), "assign");
        }

        StringBuilder changes = new StringBuilder();

        if (req.getEmail() != null && !req.getEmail().equals(targetUser.getEmail())) {
            if (userRepository.existsByEmailAndIdNot(req.getEmail(), targetUser.getId())) {
                throw AppException.conflict("This email is already registered");
            }
            targetUser.setEmail(req.getEmail());
            changes.append("Updated email. ");
        }

        if (req.getMobileNumber() != null && !req.getMobileNumber().equals(targetUser.getMobileNumber())) {
            if (userRepository.existsByMobileNumberAndIdNot(req.getMobileNumber(), targetUser.getId())) {
                throw AppException.conflict("This mobile number is already registered");
            }
            targetUser.setMobileNumber(req.getMobileNumber());
            changes.append("Updated mobile number. ");
        }

        if (req.getFirstName() != null && !req.getFirstName().equals(targetUser.getFirstName())) {
            targetUser.setFirstName(req.getFirstName());
            changes.append("Updated first name. ");
        }
        if (req.getLastName() != null && !req.getLastName().equals(targetUser.getLastName())) {
            targetUser.setLastName(req.getLastName());
            changes.append("Updated last name. ");
        }
        if (req.getRole() != null && targetUser.getRole() != req.getRole()) {
            targetUser.setRole(req.getRole());
            changes.append("Changed role to ").append(req.getRole()).append(". ");
        }
        if (req.getIsActive() != null && targetUser.isActive() != req.getIsActive()) {
            targetUser.setActive(req.getIsActive());
            changes.append(req.getIsActive() ? "Activated user. " : "Deactivated user. ");
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            targetUser.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            changes.append("Reset password. ");
        }

        User savedUser = userRepository.save(targetUser);

        logActivity(savedUser, "UPDATE_USER", changes.toString().trim());

        return UserDto.from(savedUser);
    }

    @Transactional
    public DoctorDto updateDoctor(Long doctorId, ManagementUpdateDoctorRequest req) {
        Doctor targetDoctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> AppException.notFound("Doctor not found"));

        if (targetDoctor.getUser() != null) {
            validateTargetRole(targetDoctor.getUser().getRole(), "modify");
        }

        StringBuilder changes = new StringBuilder();

        if (req.getSpecialization() != null && !req.getSpecialization().equals(targetDoctor.getSpecialization())) {
            targetDoctor.setSpecialization(req.getSpecialization());
            changes.append("Updated specialization. ");
        }
        if (req.getHospital() != null && !req.getHospital().equals(targetDoctor.getHospital())) {
            targetDoctor.setHospital(req.getHospital());
            changes.append("Updated hospital. ");
        }
        if (req.getDepartment() != null && !req.getDepartment().equals(targetDoctor.getDepartment())) {
            targetDoctor.setDepartment(req.getDepartment());
            changes.append("Updated department. ");
        }
        if (req.getConsultationFee() != null && !req.getConsultationFee().equals(targetDoctor.getConsultationFee())) {
            targetDoctor.setConsultationFee(req.getConsultationFee());
            changes.append("Updated consultation fee. ");
        }
        if (req.getBio() != null && !req.getBio().equals(targetDoctor.getBio())) {
            targetDoctor.setBio(req.getBio());
            changes.append("Updated bio. ");
        }
        if (req.getIsAvailable() != null && !req.getIsAvailable().equals(targetDoctor.getIsAvailable())) {
            targetDoctor.setIsAvailable(req.getIsAvailable());
            changes.append(req.getIsAvailable() ? "Set as available. " : "Set as unavailable. ");
        }

        Doctor savedDoctor = doctorRepository.save(targetDoctor);

        if (targetDoctor.getUser() != null) {
            logActivity(targetDoctor.getUser(), "UPDATE_DOCTOR", changes.toString().trim());
        }

        return convertToDto(savedDoctor);
    }

    private void validateTargetRole(Role role, String action) {
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) {
            throw AppException.forbidden("Management users cannot " + action + " Administrator accounts");
        }
    }

    private void logActivity(User targetUser, String action, String details) {
        if (details == null || details.isEmpty()) {
            details = "No changes made.";
        }

        User currentUser = com.pms.backend.auth.service.SecurityUtil.getCurrentUser();

        ManagementActivityLog log = ManagementActivityLog.builder()
                .performedBy(currentUser)
                .targetUser(targetUser)
                .action(action)
                .details(details)
                .build();
        activityLogRepository.save(log);
    }

    private DoctorDto convertToDto(Doctor doctor) {
        User user = doctor.getUser();
        if (user == null) {
            return null;
        }
        return DoctorDto.builder()
                .id(doctor.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .hospital(doctor.getHospital())
                .department(doctor.getDepartment())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .isAvailable(doctor.getIsAvailable())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .build();
    }
}

package com.pms.backend.profilechange.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.profilechange.dto.ProfileChangeRequestDto;
import com.pms.backend.profilechange.dto.ReviewProfileChangeRequest;
import com.pms.backend.profilechange.dto.SubmitProfileChangeRequest;
import com.pms.backend.profilechange.entity.ProfileChangeRequest;
import com.pms.backend.profilechange.entity.ProfileChangeStatus;
import com.pms.backend.profilechange.repository.ProfileChangeRequestRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileChangeRequestService {
    private final ProfileChangeRequestRepository repository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProfileChangeRequestDto submitChange(Long userId, SubmitProfileChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.DOCTOR && user.getRole() != Role.NURSE) {
            throw new AppException("Only doctors and nurses can submit profile changes", HttpStatus.FORBIDDEN);
        }

        ProfileChangeRequest changeRequest = ProfileChangeRequest.builder()
                .user(user)
                .targetRole(user.getRole().name())
                .proposedChanges(request.getProposedChanges())
                .status(ProfileChangeStatus.PENDING)
                .build();

        ProfileChangeRequest saved = repository.save(changeRequest);
        return convertToDto(saved);
    }

    public List<ProfileChangeRequestDto> getMyRequests(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProfileChangeRequestDto> getPendingRequests() {
        return repository.findByStatusOrderByCreatedAtDesc(ProfileChangeStatus.PENDING).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProfileChangeRequestDto> getAllRequests() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileChangeRequestDto approveRequest(Long requestId, Long reviewerId, String reviewNotes) {
        ProfileChangeRequest changeRequest = repository.findById(requestId)
                .orElseThrow(() -> new AppException("Profile change request not found", HttpStatus.NOT_FOUND));

        if (changeRequest.getStatus() != ProfileChangeStatus.PENDING) {
            throw new AppException("Request already " + changeRequest.getStatus().name().toLowerCase(), HttpStatus.BAD_REQUEST);
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException("Reviewer not found", HttpStatus.NOT_FOUND));

        try {
            applyChanges(changeRequest);
        } catch (Exception e) {
            throw new AppException("Failed to apply changes: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        changeRequest.setStatus(ProfileChangeStatus.APPROVED);
        changeRequest.setReviewedBy(reviewer);
        changeRequest.setReviewNotes(reviewNotes);

        ProfileChangeRequest saved = repository.save(changeRequest);
        return convertToDto(saved);
    }

    @Transactional
    public ProfileChangeRequestDto rejectRequest(Long requestId, Long reviewerId, ReviewProfileChangeRequest request) {
        ProfileChangeRequest changeRequest = repository.findById(requestId)
                .orElseThrow(() -> new AppException("Profile change request not found", HttpStatus.NOT_FOUND));

        if (changeRequest.getStatus() != ProfileChangeStatus.PENDING) {
            throw new AppException("Request already " + changeRequest.getStatus().name().toLowerCase(), HttpStatus.BAD_REQUEST);
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException("Reviewer not found", HttpStatus.NOT_FOUND));

        changeRequest.setStatus(ProfileChangeStatus.REJECTED);
        changeRequest.setReviewedBy(reviewer);
        changeRequest.setReviewNotes(request.getReviewNotes());

        ProfileChangeRequest saved = repository.save(changeRequest);
        return convertToDto(saved);
    }

    private void applyChanges(ProfileChangeRequest changeRequest) {
        try {
            JsonNode changes = objectMapper.readTree(changeRequest.getProposedChanges());
            User user = changeRequest.getUser();

            if (changes.has("firstName")) user.setFirstName(changes.get("firstName").asText());
            if (changes.has("lastName")) user.setLastName(changes.get("lastName").asText());
            if (changes.has("email")) user.setEmail(changes.get("email").asText());
            if (changes.has("mobileNumber")) user.setMobileNumber(changes.get("mobileNumber").asText());
            userRepository.save(user);

            if ("DOCTOR".equals(changeRequest.getTargetRole())) {
                Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
                if (doctor != null) {
                    if (changes.has("specialization")) doctor.setSpecialization(changes.get("specialization").asText());
                    if (changes.has("hospital")) doctor.setHospital(changes.get("hospital").asText());
                    if (changes.has("department")) doctor.setDepartment(changes.get("department").asText());
                    if (changes.has("consultationFee")) doctor.setConsultationFee(changes.get("consultationFee").asDouble());
                    if (changes.has("bio")) doctor.setBio(changes.get("bio").asText());
                    doctorRepository.save(doctor);
                }
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse proposed changes", e);
        }
    }

    private ProfileChangeRequestDto convertToDto(ProfileChangeRequest request) {
        return ProfileChangeRequestDto.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userFirstName(request.getUser().getFirstName())
                .userLastName(request.getUser().getLastName())
                .userEmail(request.getUser().getEmail())
                .userRole(request.getUser().getRole().name())
                .targetRole(request.getTargetRole())
                .proposedChanges(request.getProposedChanges())
                .status(request.getStatus().name())
                .reviewedBy(request.getReviewedBy() != null ? request.getReviewedBy().getId() : null)
                .reviewNotes(request.getReviewNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}

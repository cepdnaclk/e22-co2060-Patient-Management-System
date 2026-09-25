package com.pms.backend.profilechange.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.service.NotificationService;
import com.pms.backend.profilechange.dto.ProfileChangeRequestDto;
import com.pms.backend.profilechange.dto.ReviewProfileChangeRequest;
import com.pms.backend.profilechange.dto.SubmitProfileChangeRequest;
import com.pms.backend.profilechange.entity.ProfileChangeRequest;
import com.pms.backend.profilechange.entity.ProfileChangeStatus;
import com.pms.backend.profilechange.repository.ProfileChangeRequestRepository;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileChangeRequestService Unit Tests")
class ProfileChangeRequestServiceTest {

    @Mock
    private ProfileChangeRequestRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ProfileChangeRequestService profileChangeRequestService;

    private User doctorUser;
    private User reviewerUser;
    private Doctor doctorEntity;
    private ProfileChangeRequest pendingRequest;

    @BeforeEach
    void setUp() {
        doctorUser = User.builder()
                .id(10L)
                .firstName("John")
                .lastName("Watson")
                .email("watson@hospital.org")
                .mobileNumber("+15551234")
                .role(Role.DOCTOR)
                .build();

        reviewerUser = User.builder()
                .id(2L)
                .firstName("Mycroft")
                .lastName("Holmes")
                .email("mycroft@hospital.org")
                .role(Role.MANAGEMENT)
                .build();

        doctorEntity = Doctor.builder()
                .id(20L)
                .user(doctorUser)
                .specialization("General Practice")
                .hospital("St Barts")
                .department("Outpatient")
                .consultationFee(100.0)
                .bio("Army doctor")
                .build();

        pendingRequest = ProfileChangeRequest.builder()
                .id(100L)
                .user(doctorUser)
                .targetRole("DOCTOR")
                .proposedChanges("{\"firstName\":\"Jonathan\",\"specialization\":\"Trauma Surgery\",\"consultationFee\":180.0}")
                .status(ProfileChangeStatus.PENDING)
                .build();
    }

    @Nested
    @DisplayName("submitChange()")
    class SubmitChangeTests {

        @Test
        @DisplayName("Happy path: creates PENDING change request and notifies managers")
        void submitChange_Success() {
            SubmitProfileChangeRequest req = new SubmitProfileChangeRequest();
            req.setProposedChanges("{\"firstName\":\"Jonathan\"}");

            when(userRepository.findById(10L)).thenReturn(Optional.of(doctorUser));
            when(repository.save(any(ProfileChangeRequest.class))).thenAnswer(inv -> {
                ProfileChangeRequest r = inv.getArgument(0);
                r.setId(101L);
                return r;
            });
            when(userRepository.findByRole(Role.MANAGEMENT)).thenReturn(List.of(reviewerUser));

            ProfileChangeRequestDto dto = profileChangeRequestService.submitChange(10L, req);

            assertThat(dto).isNotNull();
            assertThat(dto.getId()).isEqualTo(101L);
            assertThat(dto.getUserId()).isEqualTo(10L);
            assertThat(dto.getStatus()).isEqualTo("PENDING");

            verify(repository).save(any(ProfileChangeRequest.class));
            verify(notificationService).createNotification(
                    eq(2L),
                    eq("Profile Change Request"),
                    contains("John Watson has submitted a profile change request."),
                    eq(NotificationType.SYSTEM_ALERT),
                    eq(101L)
            );
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when submitting user does not exist")
        void submitChange_UserNotFound() {
            SubmitProfileChangeRequest req = new SubmitProfileChangeRequest();
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileChangeRequestService.submitChange(99L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Fails with 403 FORBIDDEN when user is not DOCTOR or NURSE")
        void submitChange_InvalidRole_Forbidden() {
            User patient = User.builder().id(30L).role(Role.PATIENT).build();
            when(userRepository.findById(30L)).thenReturn(Optional.of(patient));

            SubmitProfileChangeRequest req = new SubmitProfileChangeRequest();

            assertThatThrownBy(() -> profileChangeRequestService.submitChange(30L, req))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(appEx.getMessage()).isEqualTo("Only doctors and nurses can submit profile changes");
                    });
        }
    }

    @Nested
    @DisplayName("Queries: getMyRequests(), getPendingRequests(), getAllRequests()")
    class QueryTests {

        @Test
        @DisplayName("getMyRequests returns mapped list")
        void getMyRequests_Success() {
            when(repository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(pendingRequest));

            List<ProfileChangeRequestDto> list = profileChangeRequestService.getMyRequests(10L);

            assertThat(list).hasSize(1);
            assertThat(list.get(0).getId()).isEqualTo(100L);
        }

        @Test
        @DisplayName("getPendingRequests returns pending requests")
        void getPendingRequests_Success() {
            when(repository.findByStatusOrderByCreatedAtDesc(ProfileChangeStatus.PENDING))
                    .thenReturn(List.of(pendingRequest));

            List<ProfileChangeRequestDto> list = profileChangeRequestService.getPendingRequests();

            assertThat(list).hasSize(1);
            assertThat(list.get(0).getStatus()).isEqualTo("PENDING");
        }

        @Test
        @DisplayName("getAllRequests returns all requests")
        void getAllRequests_Success() {
            when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(pendingRequest));

            List<ProfileChangeRequestDto> list = profileChangeRequestService.getAllRequests();

            assertThat(list).hasSize(1);
        }
    }

    @Nested
    @DisplayName("approveRequest()")
    class ApproveRequestTests {

        @Test
        @DisplayName("Happy path: parses proposed changes, updates User and Doctor, marks APPROVED")
        void approveRequest_Success() {
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));
            when(userRepository.findById(2L)).thenReturn(Optional.of(reviewerUser));
            when(doctorRepository.findByUserId(10L)).thenReturn(Optional.of(doctorEntity));
            when(repository.save(any(ProfileChangeRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ProfileChangeRequestDto dto = profileChangeRequestService.approveRequest(100L, 2L, "Verified license & credentials");

            assertThat(dto.getStatus()).isEqualTo("APPROVED");
            assertThat(dto.getReviewedBy()).isEqualTo(2L);
            assertThat(dto.getReviewNotes()).isEqualTo("Verified license & credentials");

            // Verify User changes applied
            assertThat(doctorUser.getFirstName()).isEqualTo("Jonathan");
            verify(userRepository).save(doctorUser);

            // Verify Doctor changes applied
            assertThat(doctorEntity.getSpecialization()).isEqualTo("Trauma Surgery");
            assertThat(doctorEntity.getConsultationFee()).isEqualTo(180.0);
            verify(doctorRepository).save(doctorEntity);
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when request does not exist")
        void approveRequest_NotFound() {
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileChangeRequestService.approveRequest(999L, 2L, "Notes"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when request is already APPROVED")
        void approveRequest_AlreadyApproved() {
            pendingRequest.setStatus(ProfileChangeStatus.APPROVED);
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));

            assertThatThrownBy(() -> profileChangeRequestService.approveRequest(100L, 2L, "Notes"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).contains("already approved");
                    });
        }

        @Test
        @DisplayName("Fails with 404 NOT_FOUND when reviewer does not exist")
        void approveRequest_ReviewerNotFound() {
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileChangeRequestService.approveRequest(100L, 99L, "Notes"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
        }

        @Test
        @DisplayName("Fails with 500 INTERNAL_SERVER_ERROR when proposed changes is invalid JSON")
        void approveRequest_InvalidJson_ThrowsInternalServerError() {
            pendingRequest.setProposedChanges("{invalid-json-content");
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));
            when(userRepository.findById(2L)).thenReturn(Optional.of(reviewerUser));

            assertThatThrownBy(() -> profileChangeRequestService.approveRequest(100L, 2L, "Notes"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
                        assertThat(appEx.getMessage()).contains("Failed to apply changes");
                    });
        }
    }

    @Nested
    @DisplayName("rejectRequest()")
    class RejectRequestTests {

        @Test
        @DisplayName("Happy path: marks status REJECTED and saves review notes")
        void rejectRequest_Success() {
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));
            when(userRepository.findById(2L)).thenReturn(Optional.of(reviewerUser));
            when(repository.save(any(ProfileChangeRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ReviewProfileChangeRequest reviewReq = new ReviewProfileChangeRequest();
            reviewReq.setReviewNotes("Incomplete supporting documentation");

            ProfileChangeRequestDto dto = profileChangeRequestService.rejectRequest(100L, 2L, reviewReq);

            assertThat(dto.getStatus()).isEqualTo("REJECTED");
            assertThat(dto.getReviewedBy()).isEqualTo(2L);
            assertThat(dto.getReviewNotes()).isEqualTo("Incomplete supporting documentation");

            verify(doctorRepository, never()).save(any());
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when request is already REJECTED")
        void rejectRequest_AlreadyRejected() {
            pendingRequest.setStatus(ProfileChangeStatus.REJECTED);
            when(repository.findById(100L)).thenReturn(Optional.of(pendingRequest));

            ReviewProfileChangeRequest reviewReq = new ReviewProfileChangeRequest();

            assertThatThrownBy(() -> profileChangeRequestService.rejectRequest(100L, 2L, reviewReq))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        }
    }
}

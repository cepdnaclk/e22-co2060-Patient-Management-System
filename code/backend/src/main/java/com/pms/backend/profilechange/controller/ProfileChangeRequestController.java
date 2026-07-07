package com.pms.backend.profilechange.controller;

import com.pms.backend.profilechange.dto.ProfileChangeRequestDto;
import com.pms.backend.profilechange.dto.ReviewProfileChangeRequest;
import com.pms.backend.profilechange.dto.SubmitProfileChangeRequest;
import com.pms.backend.profilechange.service.ProfileChangeRequestService;
import com.pms.backend.auth.service.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile-changes")
@RequiredArgsConstructor
public class ProfileChangeRequestController {
    private final ProfileChangeRequestService service;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('NURSE')")
    public ResponseEntity<ProfileChangeRequestDto> submitChange(@RequestBody SubmitProfileChangeRequest request) {
        Long userId = SecurityUtil.getCurrentUser().getId();
        ProfileChangeRequestDto dto = service.submitChange(userId, request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('NURSE')")
    public ResponseEntity<List<ProfileChangeRequestDto>> getMyRequests() {
        Long userId = SecurityUtil.getCurrentUser().getId();
        return ResponseEntity.ok(service.getMyRequests(userId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ProfileChangeRequestDto>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ProfileChangeRequestDto>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ProfileChangeRequestDto> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewProfileChangeRequest request) {
        Long reviewerId = SecurityUtil.getCurrentUser().getId();
        String notes = request != null ? request.getReviewNotes() : null;
        return ResponseEntity.ok(service.approveRequest(id, reviewerId, notes));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGEMENT') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ProfileChangeRequestDto> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewProfileChangeRequest request) {
        Long reviewerId = SecurityUtil.getCurrentUser().getId();
        ReviewProfileChangeRequest req = request != null ? request : new ReviewProfileChangeRequest();
        return ResponseEntity.ok(service.rejectRequest(id, reviewerId, req));
    }
}

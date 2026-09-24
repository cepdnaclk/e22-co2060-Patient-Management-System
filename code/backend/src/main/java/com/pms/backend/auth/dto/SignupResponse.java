package com.pms.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response returned after initial signup (before OTP verification).
 * Does NOT contain tokens — those are issued only after OTP is verified.
 */
@Data
@AllArgsConstructor
public class SignupResponse {
    private String message;
    private String email;
}

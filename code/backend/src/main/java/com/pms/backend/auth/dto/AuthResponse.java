package com.pms.backend.auth.dto;

import com.pms.backend.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String  accessToken;   // Short-lived JWT (15 min)
    private String  refreshToken;  // Long-lived opaque token (7 days)
    private UserDto user;          // Safe user info for display in the UI
}

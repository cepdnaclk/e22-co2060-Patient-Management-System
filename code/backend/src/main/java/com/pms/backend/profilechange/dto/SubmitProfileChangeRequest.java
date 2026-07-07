package com.pms.backend.profilechange.dto;

import lombok.Data;

@Data
public class SubmitProfileChangeRequest {
    private String proposedChanges; // JSON string
}

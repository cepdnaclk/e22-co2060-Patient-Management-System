package com.pms.backend.billing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePendingItemRequest {
    private Long patientId;
    private String department;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
}

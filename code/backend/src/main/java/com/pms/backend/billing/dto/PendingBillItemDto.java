package com.pms.backend.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PendingBillItemDto {
    private Long id;
    private Long patientId;
    private String department;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;
}

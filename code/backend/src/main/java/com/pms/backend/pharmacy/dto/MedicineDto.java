package com.pms.backend.pharmacy.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicineDto {
    private Long id;
    private String name;
    private String genericName;
    private String manufacturer;
    private Integer stockQuantity;
    private BigDecimal unitPrice;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

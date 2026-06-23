package com.pms.backend.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Request body to create a new invoice.
 * Example:
 * {
 *   "patientId": 12,
 *   "appointmentId": 5,
 *   "items": [
 *     { "description": "Consultation - Dr. Perera", "quantity": 1, "unitPrice": 1500.00, "itemType": "CONSULTATION" },
 *     { "description": "Paracetamol 500mg x10", "quantity": 1, "unitPrice": 150.00, "itemType": "MEDICINE" }
 *   ],
 *   "discount": 0,
 *   "tax": 0,
 *   "notes": "Cash payment"
 * }
 */
@Data
public class CreateInvoiceRequest {
    private Long         patientId;
    private Long         appointmentId;
    private List<ItemDto> items;
    private BigDecimal   discount;
    private BigDecimal   tax;
    private String       notes;
    private String       paymentMethod; // CASH, CARD, INSURANCE, ONLINE

    @Data
    public static class ItemDto {
        private String     description;
        private int        quantity;
        private BigDecimal unitPrice;
        private String     itemType; // CONSULTATION, MEDICINE, LAB_TEST, PROCEDURE, BED_CHARGE, OTHER
    }
}

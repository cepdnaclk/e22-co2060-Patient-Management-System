package com.pms.backend.billing.repository;

import com.pms.backend.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    Page<Invoice> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    @Query("SELECT SUM(i.paidAmount) FROM Invoice i WHERE i.status IN ('PAID', 'PARTIALLY_PAID')")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'ISSUED' OR i.status = 'PARTIALLY_PAID'")
    long countOutstandingInvoices();

    Page<Invoice> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable);
}

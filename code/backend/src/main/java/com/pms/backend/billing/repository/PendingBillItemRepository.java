package com.pms.backend.billing.repository;

import com.pms.backend.billing.entity.PendingBillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingBillItemRepository extends JpaRepository<PendingBillItem, Long> {
    
    List<PendingBillItem> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, String status);

    @Query("SELECT DISTINCT p.patient.id FROM PendingBillItem p WHERE p.status = 'PENDING'")
    List<Long> findDistinctPatientIdsWithPendingItems();
}

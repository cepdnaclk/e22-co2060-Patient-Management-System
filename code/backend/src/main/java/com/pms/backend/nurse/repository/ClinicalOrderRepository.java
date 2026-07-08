package com.pms.backend.nurse.repository;

import com.pms.backend.nurse.entity.ClinicalOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalOrderRepository extends JpaRepository<ClinicalOrder, Long> {
    List<ClinicalOrder> findByPatientId(Long patientId);
    List<ClinicalOrder> findByPatientIdAndStatus(Long patientId, String status);
}

package com.pms.backend.nurse.repository;

import com.pms.backend.nurse.entity.MedicationOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationOrderRepository extends JpaRepository<MedicationOrder, Long> {
    List<MedicationOrder> findByPatientId(Long patientId);
    List<MedicationOrder> findByPatientIdAndStatus(Long patientId, String status);
}

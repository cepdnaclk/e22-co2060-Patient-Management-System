package com.pms.backend.nurse.repository;

import com.pms.backend.nurse.entity.VitalsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VitalsRecordRepository extends JpaRepository<VitalsRecord, Long> {
    List<VitalsRecord> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    VitalsRecord findTopByPatientIdOrderByRecordedAtDesc(Long patientId);
}

package com.pms.backend.nurse.repository;

import com.pms.backend.nurse.entity.MedAdministration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedAdministrationRepository extends JpaRepository<MedAdministration, Long> {
    List<MedAdministration> findByOrderId(Long orderId);
}

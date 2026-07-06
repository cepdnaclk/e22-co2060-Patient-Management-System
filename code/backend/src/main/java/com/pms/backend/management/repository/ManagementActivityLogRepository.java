package com.pms.backend.management.repository;

import com.pms.backend.management.entity.ManagementActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManagementActivityLogRepository extends JpaRepository<ManagementActivityLog, Long> {
}

package com.pms.backend.profilechange.repository;

import com.pms.backend.profilechange.entity.ProfileChangeRequest;
import com.pms.backend.profilechange.entity.ProfileChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfileChangeRequestRepository extends JpaRepository<ProfileChangeRequest, Long> {
    List<ProfileChangeRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ProfileChangeRequest> findByStatusOrderByCreatedAtDesc(ProfileChangeStatus status);
    List<ProfileChangeRequest> findAllByOrderByCreatedAtDesc();
}

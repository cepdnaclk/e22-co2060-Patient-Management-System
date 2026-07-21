package com.pms.backend.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByMobileNumberAndIdNot(String mobileNumber, Long id);

    long countByRole(Role role);

    List<User> findByRoleAndIsActive(Role role, boolean isActive);
}

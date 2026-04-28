package com.pms.backend.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pms.backend.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository<User, Long>:
    //   User = the entity class
    //   Long = the type of the @Id field
    // This gives you free: save(), findById(), findAll(), delete(), count()

    // Spring Data reads the method name and writes the SQL for you:
    // findByEmail → SELECT * FROM users WHERE email = ? LIMIT 1
    Optional<User> findByEmail(String email);
    // Optional means: might return a User, might return empty.
    // Safer than returning null — forces you to handle the "not found" case.

    // existsByEmail → SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
    // Used in signup to check if email is already taken.
    boolean existsByMobileNumber(String mobileNumber);

    long countByRole(com.pms.backend.role.entity.Role role);
}

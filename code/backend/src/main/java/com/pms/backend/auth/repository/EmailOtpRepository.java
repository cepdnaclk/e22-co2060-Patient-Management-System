package com.pms.backend.auth.repository;

import com.pms.backend.auth.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    /**
     * Find the latest non-verified OTP for a given email.
     * We order by createdAt DESC so we always get the most recent one.
     */
    Optional<EmailOtp> findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    /**
     * Clean up expired OTPs to keep the table lean.
     */
    @Modifying
    @Query("DELETE FROM EmailOtp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(LocalDateTime now);

    /**
     * Count how many OTPs were created for this email in the last N minutes.
     * Used for rate-limiting OTP resends.
     */
    long countByEmailAndCreatedAtAfter(String email, LocalDateTime since);
}

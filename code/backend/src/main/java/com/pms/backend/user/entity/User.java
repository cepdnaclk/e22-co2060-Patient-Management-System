package com.pms.backend.user.entity;

import com.pms.backend.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import jakarta.persistence.Column;

@Entity
// @Entity tells JPA: "This class maps to a database table"

@Table(name = "users")
// @Table tells JPA: "The table is named users"

@Data
// Lombok: generates getters, setters, equals, hashCode, toString
// Without this you would write 50+ lines of boilerplate

@Builder
// Lombok: allows User.builder().email("x").role(Role.PATIENT).build()
// Much cleaner than calling a constructor with 8 parameters

@NoArgsConstructor
// Lombok: generates empty constructor → JPA REQUIRES this to exist

@AllArgsConstructor
// Lombok: generates constructor with all fields → @Builder needs this

public class User implements UserDetails {
    // implements UserDetails → Spring Security can use this class directly
    // We must implement the methods Spring Security requires (shown below)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // IDENTITY = auto-increment: 1, 2, 3...
    // Matches BIGSERIAL in PostgreSQL
    private Long id;

    @Column(name = "firstname", nullable = false)
    private String firstName;

    @Column(name = "lastname", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    // unique = true: prevents two users with same email
    // nullable = false: email is required
    private String email;

    @Column(name = "mobilenumber", unique = true, nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String passwordHash;
    // NEVER store plain text here.
    // BCrypt hash stored: "$2a$10$xG9z3K..."

    @Enumerated(EnumType.STRING)
    // EnumType.STRING: stores "DOCTOR" in DB, not the number 2
    // Without this, it would store 2 — your DB becomes unreadable
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private int failedLoginAttempts = 0;

    @Column
    private LocalDateTime lockedUntil;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    /**
     * Returns true if the account is currently locked due to too many failed
     * attempts.
     */
    public boolean isCurrentlyLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    // ──── Spring Security required methods ──────────────────────────
    // Spring calls these to understand this user's permissions and status.

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Returns a list of what this user is allowed to do.
        // Format: "ROLE_DOCTOR", "ROLE_PATIENT" (Spring requires the ROLE_ prefix)
        // @PreAuthorize("hasRole('DOCTOR')") checks against this.
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        // Spring reads the password from here for comparison.
        // We return passwordHash — Spring handles BCrypt comparison.
        return passwordHash;
    }

    @Override
    public String getUsername() {
        // Spring expects a "username" — we use email as the unique identifier.
        return email;
    }

    // Account status methods.
    // isAccountNonLocked checks isActive → deactivated accounts cannot log in.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

}

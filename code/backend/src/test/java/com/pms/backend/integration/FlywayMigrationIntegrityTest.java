package com.pms.backend.integration;

import com.pms.backend.BackendApplication;
import com.pms.backend.BasePostgresIntegrationTest;
import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Flyway Migration Integrity and SuperAdmin Seeding Test")
class FlywayMigrationIntegrityTest extends BasePostgresIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BackendApplication backendApplication;

    @Test
    @DisplayName("Applies migrations V1 through V17 without conflict and verifies exactly one SUPER_ADMIN is seeded")
    void testFlywayMigrations_And_SeedSuperAdminIntegrity() throws Exception {
        // 1. Create and run Flyway migration programmatically
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        flyway.migrate();

        // Verify Flyway migrations were applied cleanly without conflict
        MigrationInfo[] appliedMigrations = flyway.info().applied();
        assertThat(appliedMigrations).isNotEmpty();

        List<MigrationInfo> failedMigrations = Arrays.stream(appliedMigrations)
                .filter(m -> m.getState() == MigrationState.FAILED)
                .toList();
        assertThat(failedMigrations)
                .as("No Flyway migrations should be in FAILED state")
                .isEmpty();

        // Check that V1 and the latest migration (V18) are present in applied migrations
        boolean hasV1 = Arrays.stream(appliedMigrations).anyMatch(m -> "1".equals(m.getVersion().getVersion()));
        boolean hasV18 = Arrays.stream(appliedMigrations).anyMatch(m -> "18".equals(m.getVersion().getVersion()));
        assertThat(hasV1).as("Migration V1 should be applied").isTrue();
        assertThat(hasV18).as("Migration V18 should be applied").isTrue();

        // 2. Clear existing superadmins to test seedSuperAdmin in isolation
        userRepository.deleteAll(userRepository.findByRole(Role.SUPER_ADMIN));
        assertThat(userRepository.countByRole(Role.SUPER_ADMIN)).isZero();

        // 3. Execute seedSuperAdmin runner
        CommandLineRunner runner = backendApplication.seedSuperAdmin(
                userRepository,
                passwordEncoder,
                "superadmin@pms.local",
                "SuperAdmin@123",
                "System",
                "Admin",
                "0000000000"
        );
        runner.run();

        // Assert exactly one SUPER_ADMIN exists
        assertThat(userRepository.countByRole(Role.SUPER_ADMIN)).isEqualTo(1L);
        User seeded = userRepository.findByEmail("superadmin@pms.local").orElse(null);
        assertThat(seeded).isNotNull();
        assertThat(seeded.getRole()).isEqualTo(Role.SUPER_ADMIN);
        assertThat(seeded.isActive()).isTrue();
        assertThat(passwordEncoder.matches("SuperAdmin@123", seeded.getPasswordHash())).isTrue();

        // 4. Test idempotency: re-running runner should NOT create duplicate SUPER_ADMIN accounts
        runner.run();
        assertThat(userRepository.countByRole(Role.SUPER_ADMIN))
                .as("Seed runner must be idempotent and keep count at 1")
                .isEqualTo(1L);
    }
}

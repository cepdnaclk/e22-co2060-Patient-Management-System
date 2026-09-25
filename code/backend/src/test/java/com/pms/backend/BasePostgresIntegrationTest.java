package com.pms.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.backend.auth.service.EmailService;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class BasePostgresIntegrationTest {

    protected final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private static PostgreSQLContainer<?> postgresContainer;
    private static final boolean DOCKER_AVAILABLE;

    static {
        boolean available = false;
        try {
            available = DockerClientFactory.instance().isDockerAvailable();
            if (available) {
                postgresContainer = new PostgreSQLContainer<>("postgres:15-alpine")
                        .withDatabaseName("pms_integration_test")
                        .withUsername("postgres")
                        .withPassword("testpass");
                postgresContainer.start();
            }
        } catch (Throwable t) {
            available = false;
        }
        DOCKER_AVAILABLE = available;
    }

    @MockitoBean
    protected EmailService emailService;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String url;
        String user;
        String pass;
        if (DOCKER_AVAILABLE && postgresContainer != null && postgresContainer.isRunning()) {
            url = postgresContainer.getJdbcUrl();
            user = postgresContainer.getUsername();
            pass = postgresContainer.getPassword();
        } else {
            url = "jdbc:postgresql://localhost:5432/pms_test";
            user = "postgres";
            pass = "1234";
        }

        try {
            org.flywaydb.core.Flyway flyway = org.flywaydb.core.Flyway.configure()
                    .dataSource(url, user, pass)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .load();
            flyway.migrate();
        } catch (Exception e) {
            System.err.println("Flyway pre-migration exception: " + e.getMessage());
            throw new RuntimeException(e);
        }

        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> user);
        registry.add("spring.datasource.password", () -> pass);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("app.jwt.secret", () -> "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9u");
        registry.add("app.superadmin.email", () -> "superadmin@pms.local");
        registry.add("app.superadmin.password", () -> "SuperAdmin@123");
        registry.add("app.superadmin.first-name", () -> "System");
        registry.add("app.superadmin.last-name", () -> "Admin");
        registry.add("app.superadmin.mobile-number", () -> "0000000000");
    }
}

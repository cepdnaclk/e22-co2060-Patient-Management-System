package com.pms.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Value("${spring.flyway.enabled:true}")
    private boolean flywayEnabled;

    @Value("${spring.flyway.locations:classpath:db/migration}")
    private String flywayLocations;

    @Value("${spring.flyway.baseline-on-migrate:true}")
    private boolean baselineOnMigrate;

    @Bean
    public Flyway flyway(DataSource dataSource) {
        if (!flywayEnabled) {
            return null;
        }
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations(flywayLocations)
                .baselineOnMigrate(baselineOnMigrate)
                .load();
        flyway.migrate();
        return flyway;
    }
}

package com.pms.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.net.URI;

/**
 * Parses Render/Railway's DATABASE_URL into individual Spring datasource properties.
 * DATABASE_URL format: postgresql://user:password@host:port/dbname
 */
@Configuration
@Profile("prod")
public class DataSourceConfig {

    static {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                URI uri = new URI(databaseUrl.replace("postgresql://", "http://"));
                String host     = uri.getHost();
                int    port     = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path     = uri.getPath().replaceFirst("/", "");
                String userInfo = uri.getUserInfo();

                String user     = userInfo != null ? userInfo.split(":")[0] : "";
                String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":", 2)[1] : "";

                String jdbcUrl  = "jdbc:postgresql://" + host + ":" + port + "/" + path + "?sslmode=require";

                System.setProperty("spring.datasource.url",      jdbcUrl);
                System.setProperty("spring.datasource.username", user);
                System.setProperty("spring.datasource.password", password);

                System.out.println("[DataSourceConfig] DATABASE_URL parsed successfully. Host: " + host);
            } catch (Exception e) {
                System.err.println("[DataSourceConfig] Failed to parse DATABASE_URL: " + e.getMessage());
            }
        } else {
            System.out.println("[DataSourceConfig] No DATABASE_URL found, using PGHOST/PGUSER/PGPASSWORD env vars.");
        }
    }
}

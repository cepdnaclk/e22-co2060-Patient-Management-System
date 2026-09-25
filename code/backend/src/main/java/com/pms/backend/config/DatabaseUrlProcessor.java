package com.pms.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Runs BEFORE Spring resolves application.properties.
 * Parses Render/Railway's DATABASE_URL and injects proper datasource properties.
 * DATABASE_URL format: postgresql://user:password@host:port/dbname
 */
public class DatabaseUrlProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            System.out.println("[DatabaseUrlProcessor] No DATABASE_URL found, skipping.");
            return;
        }

        try {
            URI uri = new URI(databaseUrl.replace("postgresql://", "http://"));
            String host     = uri.getHost();
            int    port     = uri.getPort() > 0 ? uri.getPort() : 5432;
            String dbName   = uri.getPath().replaceFirst("/", "");
            String userInfo = uri.getUserInfo();

            String user     = userInfo != null ? userInfo.split(":")[0] : "";
            String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":", 2)[1] : "";

            String jdbcUrl  = "jdbc:postgresql://" + host + ":" + port + "/" + dbName + "?sslmode=require";

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url",      jdbcUrl);
            props.put("spring.datasource.username", user);
            props.put("spring.datasource.password", password);

            environment.getPropertySources()
                    .addFirst(new MapPropertySource("renderDatabaseUrl", props));

            System.out.println("[DatabaseUrlProcessor] DATABASE_URL parsed OK. Host=" + host + " DB=" + dbName);
        } catch (Exception e) {
            System.err.println("[DatabaseUrlProcessor] Failed to parse DATABASE_URL: " + e.getMessage());
        }
    }
}

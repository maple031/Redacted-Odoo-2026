package com.stocksense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Test application entry point for running the full application locally
 * with a Testcontainers-managed PostgreSQL database (no local Postgres required).
 *
 * <p>Usage:
 * <pre>{@code
 *   # From IDE: run TestStockSenseApplication.main()
 *   # From CLI:
 *   mvn spring-boot:test-run
 * }</pre>
 *
 * <p>The datasource is wired automatically via {@code @ServiceConnection}.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestStockSenseApplication {

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>("postgres:17-alpine");
    }

    public static void main(String[] args) {
        SpringApplication
                .from(StockSenseApplication::main)
                .with(TestStockSenseApplication.class)
                .run(args);
    }
}

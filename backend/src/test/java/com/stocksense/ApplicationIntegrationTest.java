package com.stocksense;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke test: verifies the Spring context loads, Flyway migrations run successfully
 * against a real PostgreSQL instance spun up by Testcontainers, and the web server
 * starts on a random port.
 *
 * <p>The datasource URL, username, and password are injected dynamically by
 * {@code @ServiceConnection} — nothing is hardcoded or read from any yml file.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class ApplicationIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @LocalServerPort
    int port;

    @Test
    void contextLoads() {
        assertThat(port).isPositive();
    }
}

package com.stocksense;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

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
@ActiveProfiles("test")
class ApplicationIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    static {
        if (System.getenv("STOCKSENSE_TEST_DB_URL") == null) {
            postgres = new PostgreSQLContainer<>("postgres:17-alpine");
            postgres.start();
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String dbUrl = System.getenv("STOCKSENSE_TEST_DB_URL");
        if (dbUrl != null) {
            registry.add("spring.datasource.url", () -> dbUrl);
            registry.add("spring.datasource.username", () -> System.getenv("SPRING_DATASOURCE_USERNAME"));
            registry.add("spring.datasource.password", () -> System.getenv("SPRING_DATASOURCE_PASSWORD"));
        } else {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
    }

    @LocalServerPort
    int port;

    @Test
    void contextLoads() {
        assertThat(port).isPositive();
    }
}

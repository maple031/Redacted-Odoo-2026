package com.stocksense.operations.core;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ReferenceNumberServiceIntegrationTest {

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

    @Autowired
    private ReferenceNumberService referenceNumberService;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbc;

    @Test
    void concurrentReferenceAllocationsAreUnique() throws InterruptedException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        UUID warehouseId = UUID.randomUUID();

        String shortCode = "WH-" + UUID.randomUUID().toString().substring(0, 4);
        jdbc.update("INSERT INTO warehouse (id, short_code, name) VALUES (?, ?, ?)", warehouseId, shortCode, "Main Warehouse");

        List<Callable<String>> tasks = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            tasks.add(() -> transactionTemplate.execute(status -> 
                    referenceNumberService.generateReferenceNumber(warehouseId, OperationType.RECEIPT)));
        }

        List<Future<String>> futures = executor.invokeAll(tasks);
        List<String> results = new ArrayList<>();
        
        for (Future<String> future : futures) {
            try {
                results.add(future.get());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        executor.shutdown();

        // Check if all generated references are unique
        long uniqueCount = results.stream().distinct().count();
        assertThat(uniqueCount).isEqualTo(threadCount);
        
        // Ensure they have the correct format
        for (String ref : results) {
            assertThat(ref).startsWith(shortCode + "/IN/");
        }
    }
}

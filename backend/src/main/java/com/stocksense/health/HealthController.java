package com.stocksense.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Application-level health endpoint.
 *
 * <p>This is the endpoint the frontend calls to check backend availability.
 * It is intentionally separate from {@code /actuator/health}:
 * <ul>
 *   <li>{@code /api/health} — owned by application code; safe for frontend consumption.</li>
 *   <li>{@code /actuator/health} — owned by Spring Boot Actuator; used only by
 *       Docker Compose / orchestration healthchecks.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "Application health check")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Application health", description = "Returns UP when the application is running.")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "stocksense-api"
        ));
    }
}

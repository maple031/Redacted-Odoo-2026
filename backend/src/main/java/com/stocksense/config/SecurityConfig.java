package com.stocksense.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration.
 *
 * <p>Policy:
 * <ul>
 *   <li>Unauthenticated access is permitted <em>only</em> for the paths listed below.</li>
 *   <li>Every other request requires authentication by default.</li>
 *   <li>CSRF is left in its <strong>default state</strong> (enabled).
 *       It will be addressed properly when the authentication flow is implemented
 *       on a dedicated feature branch.</li>
 * </ul>
 *
 * <p>Permitted paths (no auth required):
 * <ul>
 *   <li>{@code /api/health} — application health check consumed by the frontend.</li>
 *   <li>{@code /actuator/health} — Actuator health for Docker / orchestration checks.</li>
 *   <li>{@code /swagger-ui/**} and {@code /swagger-ui.html} — Swagger UI assets.</li>
 *   <li>{@code /v3/api-docs/**} — OpenAPI specification endpoint.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/api/health",
                        "/actuator/health",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**"
                ).permitAll()
                .anyRequest().authenticated()
        );
        // CSRF intentionally left in default state (enabled).
        // Real CSRF handling will be wired when authentication is implemented.
        return http.build();
    }
}

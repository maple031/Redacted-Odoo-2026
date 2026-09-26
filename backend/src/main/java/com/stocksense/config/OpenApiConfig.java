package com.stocksense.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration.
 *
 * <p>Swagger UI is served at {@code /swagger-ui.html}.
 * The OpenAPI JSON spec is available at {@code /v3/api-docs}.
 * Both paths are explicitly permitted in {@link SecurityConfig}.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI stockSenseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("StockSense API")
                        .description("Modular Inventory Management System — REST API")
                        .version("0.0.1-SNAPSHOT")
                );
    }
}

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk-jammy AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Resolve dependencies first for better layer caching.
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Build — tests are skipped here; CI runs them separately via Testcontainers.
COPY src ./src
RUN mvn package -DskipTests -q

# ─── Stage 2: Run ────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-jammy AS runner

# curl is required by the Docker Compose healthcheck command.
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# =============================================================================
# HireHub AI — Backend Dockerfile (Spring Boot 3 + Java 17)
# Multi-Stage Production Build: Maven Builder -> Distroless/Alpine JRE Runner
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build & Package Artifact
# -----------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# 1. Cache Maven dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# 2. Copy source code and build production fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 2: Minimal Production JRE Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

# Create non-root system user and group for container security
RUN addgroup -S hirehub && adduser -S hirehub -G hirehub

WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar /app/hirehub-backend.jar

# Adjust permissions
RUN chown -R hirehub:hirehub /app

# Switch to non-root user
USER hirehub:hirehub

# Configure application listening port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Container healthcheck using wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/v3/api-docs || exit 1

# Execute Spring Boot Application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/hirehub-backend.jar"]

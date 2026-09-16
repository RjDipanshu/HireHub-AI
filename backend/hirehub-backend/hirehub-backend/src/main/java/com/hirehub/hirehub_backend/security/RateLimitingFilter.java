package com.hirehub.hirehub_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Phase 21.0: Rate Limiting & DoS Protection Filter.
 * Enforces per-client sliding window request limits:
 * - General endpoints: 120 requests/minute
 * - AI endpoints (/api/v1/ai/**): 20 requests/minute
 * - Auth endpoints (/api/v1/auth/**): 30 requests/minute
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int GENERAL_LIMIT = 120;
    private static final int AI_LIMIT = 20;
    private static final int AUTH_LIMIT = 30;
    private static final long WINDOW_SECONDS = 60;

    private static class ClientBucket {
        long windowStartEpoch = Instant.now().getEpochSecond();
        AtomicInteger generalCount = new AtomicInteger(0);
        AtomicInteger aiCount = new AtomicInteger(0);
        AtomicInteger authCount = new AtomicInteger(0);

        synchronized void resetIfExpired(long now) {
            if (now - windowStartEpoch >= WINDOW_SECONDS) {
                windowStartEpoch = now;
                generalCount.set(0);
                aiCount.set(0);
                authCount.set(0);
            }
        }
    }

    private final Map<String, ClientBucket> clientBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip static docs, swagger, and actuator health checks from rate limiting
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        long now = Instant.now().getEpochSecond();

        ClientBucket bucket = clientBuckets.computeIfAbsent(clientKey, k -> new ClientBucket());
        bucket.resetIfExpired(now);

        int generalReqs = bucket.generalCount.incrementAndGet();
        if (generalReqs > GENERAL_LIMIT) {
            rejectWith429(response, "General rate limit exceeded. Max " + GENERAL_LIMIT + " requests per minute.");
            return;
        }

        if (path.startsWith("/api/v1/ai/")) {
            int aiReqs = bucket.aiCount.incrementAndGet();
            if (aiReqs > AI_LIMIT) {
                rejectWith429(response, "AI API rate limit exceeded. Max " + AI_LIMIT + " requests per minute.");
                return;
            }
        }

        if (path.startsWith("/api/v1/auth/")) {
            int authReqs = bucket.authCount.incrementAndGet();
            if (authReqs > AUTH_LIMIT) {
                rejectWith429(response, "Authentication rate limit exceeded. Max " + AUTH_LIMIT + " requests per minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 20) {
            // Hash token prefix to identify user without logging token
            return "user-" + Math.abs(authHeader.substring(7, Math.min(30, authHeader.length())).hashCode());
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown-client";
    }

    private void rejectWith429(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Retry-After", "60");
        response.getWriter().write(String.format(
                "{\"statusCode\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
                message, Instant.now()
        ));
    }
}

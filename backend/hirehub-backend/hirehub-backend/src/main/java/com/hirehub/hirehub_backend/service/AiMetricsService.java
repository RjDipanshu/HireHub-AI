package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.ai.AiMetricsDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Phase 27.0: Thread-Safe AI Observability, Telemetry & Cost Monitoring Service.
 */
@Slf4j
@Service
public class AiMetricsService {

    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong successfulRequests = new AtomicLong(0);
    private final AtomicLong fallbackRequests = new AtomicLong(0);
    private final AtomicLong failedRequests = new AtomicLong(0);

    private final AtomicLong totalTokens = new AtomicLong(0);
    private final AtomicLong totalLatencyMs = new AtomicLong(0);

    private final Map<String, AtomicLong> featureCounts = new ConcurrentHashMap<>();

    public void recordSuccess(String feature, long latencyMs, int estimatedTokens, boolean usedFallback) {
        totalRequests.incrementAndGet();
        if (usedFallback) {
            fallbackRequests.incrementAndGet();
        } else {
            successfulRequests.incrementAndGet();
        }
        totalLatencyMs.addAndGet(latencyMs);
        totalTokens.addAndGet(estimatedTokens);
        featureCounts.computeIfAbsent(feature, k -> new AtomicLong(0)).incrementAndGet();
    }

    public void recordFailure(String feature, long latencyMs) {
        totalRequests.incrementAndGet();
        failedRequests.incrementAndGet();
        totalLatencyMs.addAndGet(latencyMs);
        featureCounts.computeIfAbsent(feature, k -> new AtomicLong(0)).incrementAndGet();
    }

    public AiMetricsDTO getMetrics() {
        long reqs = totalRequests.get();
        double avgLatency = reqs > 0 ? (double) totalLatencyMs.get() / reqs : 0.0;
        // Estimated cost based on Gemini Flash/Embedding pricing ($0.0001 per 1K tokens)
        double estimatedCost = (totalTokens.get() / 1000.0) * 0.0001;

        Map<String, Long> byFeature = new ConcurrentHashMap<>();
        featureCounts.forEach((k, v) -> byFeature.put(k, v.get()));

        return AiMetricsDTO.builder()
                .totalRequests(reqs)
                .successfulRequests(successfulRequests.get())
                .fallbackRequests(fallbackRequests.get())
                .failedRequests(failedRequests.get())
                .totalEstimatedTokens(totalTokens.get())
                .averageLatencyMs(Math.round(avgLatency * 100.0) / 100.0)
                .totalEstimatedCostUsd(Math.round(estimatedCost * 10000.0) / 10000.0)
                .primaryModel("gemini-1.5-flash / text-embedding-004")
                .metricsCollectedAt(LocalDateTime.now())
                .requestsByFeature(byFeature)
                .build();
    }
}

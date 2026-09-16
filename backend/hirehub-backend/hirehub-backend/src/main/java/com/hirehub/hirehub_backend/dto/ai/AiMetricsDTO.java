package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Phase 27.0: AI Monitoring, Telemetry & Observability DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMetricsDTO {

    private long totalRequests;
    private long successfulRequests;
    private long fallbackRequests;
    private long failedRequests;

    private long totalEstimatedTokens;
    private double averageLatencyMs;
    private double totalEstimatedCostUsd;

    private String primaryModel;
    private LocalDateTime metricsCollectedAt;

    private Map<String, Long> requestsByFeature; // "resume-analyzer", "job-match", "semantic-search"
}

package com.hirehub.hirehub_backend.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Marketplace aggregation statistics for dashboard and admin views.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceStatsDTO {

    /** Total active jobs across all sources */
    private long totalJobs;

    /** Count of recruiter-posted internal jobs */
    private long internalJobs;

    /** Count of aggregated external jobs */
    private long externalJobs;

    /** Job count broken down by source type */
    private Map<String, Long> jobsBySource;

    /** Timestamp of the most recent aggregation sync */
    private LocalDateTime lastSyncAt;

    /** Status of the last sync (COMPLETED, FAILED, RUNNING) */
    private String lastSyncStatus;

    /** Total jobs fetched in the last sync */
    private Integer lastSyncJobsFetched;

    /** Number of active job sources */
    private int activeSourceCount;
}

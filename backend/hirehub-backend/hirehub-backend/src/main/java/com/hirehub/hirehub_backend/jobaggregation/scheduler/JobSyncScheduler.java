package com.hirehub.hirehub_backend.jobaggregation.scheduler;

import com.hirehub.hirehub_backend.jobaggregation.service.JobAggregationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobSyncScheduler {

    private final JobAggregationService aggregationService;

    /**
     * Executes automated periodic synchronization of external job postings.
     * Default: every 6 hours ("0 0 * / 6 * * *").
     */
    @Scheduled(cron = "${aggregator.sync-cron:0 0 */6 * * *}")
    public void runScheduledAggregation() {
        log.info("[JobSyncScheduler] Triggering scheduled multi-source job aggregation...");
        try {
            aggregationService.syncAll();
            log.info("[JobSyncScheduler] Scheduled multi-source job aggregation completed successfully.");
        } catch (Exception e) {
            log.error("[JobSyncScheduler] Scheduled job aggregation encountered an error: {}", e.getMessage(), e);
        }
    }
}

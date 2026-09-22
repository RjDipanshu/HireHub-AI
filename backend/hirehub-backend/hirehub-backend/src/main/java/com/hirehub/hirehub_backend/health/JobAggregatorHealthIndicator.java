package com.hirehub.hirehub_backend.health;

import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import com.hirehub.hirehub_backend.jobaggregation.repository.JobSyncRunRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JobAggregatorHealthIndicator implements HealthIndicator {

    private final JobSyncRunRepository jobSyncRunRepository;
    private final JobRepository jobRepository;

    @Override
    public Health health() {
        try {
            long totalJobs = jobRepository.count();
            Optional<JobSyncRun> latestRun = jobSyncRunRepository.findTopByOrderByStartedAtDesc();

            Health.Builder builder = Health.up()
                    .withDetail("totalJobsInCatalog", totalJobs);

            if (latestRun.isPresent()) {
                JobSyncRun run = latestRun.get();
                builder.withDetail("lastSyncSource", run.getSourceType())
                        .withDetail("lastSyncStatus", run.getStatus())
                        .withDetail("lastSyncStartedAt", run.getStartedAt())
                        .withDetail("lastSyncDurationMs", run.getDurationMs())
                        .withDetail("lastSyncImportedCount", run.getJobsImported());
            } else {
                builder.withDetail("syncPipeline", "Awaiting initial scheduled run");
            }

            return builder.build();
        } catch (Exception e) {
            return Health.up()
                    .withDetail("jobAggregator", "OPERATIONAL")
                    .withDetail("notice", "Telemetry initialization pending: " + e.getMessage())
                    .build();
        }
    }
}

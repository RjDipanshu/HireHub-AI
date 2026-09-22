package com.hirehub.hirehub_backend.jobaggregation.service;

import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.enums.SyncStatus;
import com.hirehub.hirehub_backend.jobaggregation.client.JobSourceClient;
import com.hirehub.hirehub_backend.jobaggregation.dto.ExternalJobDto;
import com.hirehub.hirehub_backend.jobaggregation.dto.JobSearchCriteria;
import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import com.hirehub.hirehub_backend.jobaggregation.repository.JobSyncRunRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAggregationService {

    private final List<JobSourceClient> clients;
    private final JobNormalizationService normalizationService;
    private final JobDeduplicationService deduplicationService;
    private final JobRepository jobRepository;
    private final JobSyncRunRepository syncRunRepository;

    /**
     * Ingests jobs from all enabled external clients.
     */
    public void syncAll() {
        log.info("[JobAggregationService] Starting global multi-source sync across {} clients...", clients.size());
        for (JobSourceClient client : clients) {
            if (client.isEnabled()) {
                syncSource(client.getSourceType());
            }
        }
    }

    /**
     * Ingests jobs from a specific source type following the mandatory:
     * Does externalJobId exist?
     *   YES -> UPDATE
     *   NO  -> INSERT
     */
    @Transactional
    public JobSyncRun syncSource(SourceType sourceType) {
        JobSourceClient client = clients.stream()
                .filter(c -> c.getSourceType() == sourceType)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No client found for source: " + sourceType));

        LocalDateTime startTime = LocalDateTime.now();
        JobSyncRun run = JobSyncRun.builder()
                .sourceType(sourceType)
                .status(SyncStatus.IN_PROGRESS)
                .startedAt(startTime)
                .build();
        run = syncRunRepository.save(run);

        int imported = 0;
        int updated = 0;
        int skipped = 0;

        try {
            JobSearchCriteria criteria = JobSearchCriteria.builder()
                    .keyword("software developer")
                    .country("in")
                    .page(1)
                    .pageSize(50)
                    .build();

            List<ExternalJobDto> fetchedJobs = client.fetchJobs(criteria);
            run.setJobsFound(fetchedJobs.size());

            for (ExternalJobDto raw : fetchedJobs) {
                try {
                    // 1. Mandatory lookup: UNIQUE(source_type, external_job_id)
                    Optional<Job> existingByExternalId = (raw.getExternalId() != null && !raw.getExternalId().isBlank())
                            ? jobRepository.findBySourceTypeAndExternalJobIdAndIsDeletedFalse(sourceType, raw.getExternalId())
                            : Optional.empty();

                    if (existingByExternalId.isPresent()) {
                        // UPDATE branch
                        Job existing = existingByExternalId.get();
                        updateExistingJob(existing, raw);
                        jobRepository.save(existing);
                        updated++;
                        continue;
                    }

                    // 2. Cross-provider content fingerprint deduplication
                    String dedupHash = deduplicationService.generateFingerprint(
                            raw.getTitle(), raw.getCompanyName(), raw.getLocation());
                    Optional<Job> existingByHash = jobRepository.findByDedupHashAndIsDeletedFalse(dedupHash);
                    if (existingByHash.isPresent()) {
                        log.debug("[JobAggregationService] Skipping duplicate content with hash {}: {} at {}",
                                dedupHash, raw.getTitle(), raw.getCompanyName());
                        skipped++;
                        continue;
                    }

                    // 3. INSERT branch
                    Job newJob = buildJobEntity(raw, dedupHash);
                    jobRepository.save(newJob);
                    imported++;

                } catch (Exception e) {
                    log.warn("[JobAggregationService] Error processing job {}: {}", raw.getExternalId(), e.getMessage());
                    skipped++;
                }
            }

            LocalDateTime endTime = LocalDateTime.now();
            run.setStatus(SyncStatus.SUCCESS);
            run.setJobsImported(imported);
            run.setJobsUpdated(updated);
            run.setJobsSkipped(skipped);
            run.setCompletedAt(endTime);
            run.setDurationMs(java.time.Duration.between(startTime, endTime).toMillis());
            syncRunRepository.save(run);

            log.info("[JobAggregationService] Completed sync for {}: Fetched: {}, New: {}, Updated: {}, Duplicate/Skipped: {} in {}ms",
                    sourceType, run.getJobsFound(), imported, updated, skipped, run.getDurationMs());

        } catch (Exception e) {
            log.error("[JobAggregationService] Sync failed for {}: {}", sourceType, e.getMessage(), e);
            run.setStatus(SyncStatus.FAILED);
            run.setErrorMessage(e.getMessage());
            run.setCompletedAt(LocalDateTime.now());
            run.setDurationMs(java.time.Duration.between(startTime, LocalDateTime.now()).toMillis());
            syncRunRepository.save(run);
        }

        return run;
    }

    /**
     * Real-time push ingestion for webhook payloads and partner APIs.
     */
    @Transactional
    public JobSyncRun ingestJobs(SourceType sourceType, List<ExternalJobDto> externalJobs) {
        LocalDateTime startTime = LocalDateTime.now();
        JobSyncRun run = JobSyncRun.builder()
                .sourceType(sourceType != null ? sourceType : SourceType.WEBHOOK)
                .status(SyncStatus.IN_PROGRESS)
                .startedAt(startTime)
                .jobsFound(externalJobs != null ? externalJobs.size() : 0)
                .build();
        run = syncRunRepository.save(run);

        if (externalJobs == null || externalJobs.isEmpty()) {
            run.setStatus(SyncStatus.SUCCESS);
            run.setCompletedAt(LocalDateTime.now());
            return syncRunRepository.save(run);
        }

        int imported = 0;
        int updated = 0;
        int skipped = 0;

        for (ExternalJobDto raw : externalJobs) {
            try {
                if (raw.getSourceType() == null) {
                    raw.setSourceType(sourceType != null ? sourceType : SourceType.WEBHOOK);
                }

                // 1. Mandatory lookup: UNIQUE(source_type, external_job_id)
                Optional<Job> existingByExternalId = (raw.getExternalId() != null && !raw.getExternalId().isBlank())
                        ? jobRepository.findBySourceTypeAndExternalJobIdAndIsDeletedFalse(raw.getSourceType(), raw.getExternalId())
                        : Optional.empty();

                if (existingByExternalId.isPresent()) {
                    Job existing = existingByExternalId.get();
                    updateExistingJob(existing, raw);
                    jobRepository.save(existing);
                    updated++;
                    continue;
                }

                // 2. Cross-provider content fingerprint deduplication
                String dedupHash = deduplicationService.generateFingerprint(
                        raw.getTitle(), raw.getCompanyName(), raw.getLocation());
                Optional<Job> existingByHash = jobRepository.findByDedupHashAndIsDeletedFalse(dedupHash);
                if (existingByHash.isPresent()) {
                    skipped++;
                    continue;
                }

                // 3. INSERT
                Job newJob = buildJobEntity(raw, dedupHash);
                jobRepository.save(newJob);
                imported++;

            } catch (Exception e) {
                log.warn("[JobAggregationService] Webhook job error {}: {}", raw.getExternalId(), e.getMessage());
                skipped++;
            }
        }

        LocalDateTime endTime = LocalDateTime.now();
        run.setStatus(SyncStatus.SUCCESS);
        run.setJobsImported(imported);
        run.setJobsUpdated(updated);
        run.setJobsSkipped(skipped);
        run.setCompletedAt(endTime);
        run.setDurationMs(java.time.Duration.between(startTime, endTime).toMillis());
        return syncRunRepository.save(run);
    }

    private void updateExistingJob(Job existing, ExternalJobDto raw) {
        existing.setLastSyncedAt(LocalDateTime.now());
        existing.setStatus(JobStatus.ACTIVE);
        if (raw.getTitle() != null && !raw.getTitle().isBlank()) {
            existing.setTitle(normalizationService.normalizeTitle(raw.getTitle()));
        }
        if (raw.getDescription() != null && !raw.getDescription().isBlank()) {
            existing.setDescription(normalizationService.normalizeDescription(raw.getDescription()));
        }
        if (raw.getExternalUrl() != null && !raw.getExternalUrl().isBlank()) {
            existing.setExternalUrl(raw.getExternalUrl());
        }
        if (raw.getMinSalary() != null) existing.setMinSalary(raw.getMinSalary());
        if (raw.getMaxSalary() != null) existing.setMaxSalary(raw.getMaxSalary());
        if (raw.getCurrency() != null) existing.setCurrency(raw.getCurrency());
    }

    private Job buildJobEntity(ExternalJobDto raw, String dedupHash) {
        Job job = new Job();
        job.setTitle(normalizationService.normalizeTitle(raw.getTitle()));
        job.setDescription(normalizationService.normalizeDescription(raw.getDescription()));
        job.setCompanyName(raw.getCompanyName() != null && !raw.getCompanyName().isBlank() ? raw.getCompanyName() : "Partner Company");
        job.setLocation(raw.getLocation() != null && !raw.getLocation().isBlank() ? raw.getLocation() : "Remote");

        job.setWorkMode(normalizationService.normalizeWorkMode(raw.getWorkMode(), raw.getLocation()));
        job.setEmploymentType(normalizationService.normalizeEmploymentType(raw.getEmploymentType()));
        job.setExperienceLevel(normalizationService.normalizeExperienceLevel(raw.getTitle(), raw.getDescription()));

        job.setMinSalary(raw.getMinSalary() != null ? raw.getMinSalary() : BigDecimal.valueOf(1200000));
        job.setMaxSalary(raw.getMaxSalary() != null ? raw.getMaxSalary() : BigDecimal.valueOf(2400000));
        job.setCurrency(raw.getCurrency() != null ? raw.getCurrency() : "INR");

        job.setStatus(JobStatus.ACTIVE);

        // Multi-Source Aggregation metadata
        job.setSourceType(raw.getSourceType() != null ? raw.getSourceType() : SourceType.ADZUNA);
        job.setExternalJobId(raw.getExternalId());
        job.setExternalUrl(raw.getExternalUrl());
        job.setSourcePostedAt(raw.getPostedAt() != null ? raw.getPostedAt() : LocalDateTime.now());
        job.setImportedAt(LocalDateTime.now());
        job.setLastSyncedAt(LocalDateTime.now());
        job.setDedupHash(dedupHash);

        return job;
    }
}

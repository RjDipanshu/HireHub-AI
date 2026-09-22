package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.entity.JobSource;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import com.hirehub.hirehub_backend.jobaggregation.repository.JobSyncRunRepository;
import com.hirehub.hirehub_backend.jobaggregation.service.JobAggregationService;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.JobSourceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Admin-only endpoints for managing the job aggregation subsystem.
 */
@Tag(name = "Admin — Aggregation", description = "Admin controls for managing external job source aggregation")
@RestController
@RequestMapping("/api/v1/admin/aggregator")
@RequiredArgsConstructor
public class AggregatorAdminController {

    private final JobAggregationService aggregationService;
    private final JobSourceRepository jobSourceRepository;
    private final JobSyncRunRepository syncRunRepository;
    private final JobRepository jobRepository;

    @Operation(summary = "Trigger manual sync",
            description = "Manually trigger job aggregation from all active external sources")
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> triggerSync(
            @RequestParam(required = false) String sourceType) {

        if (sourceType != null && !sourceType.isBlank() && !"ALL".equalsIgnoreCase(sourceType)) {
            try {
                SourceType st = SourceType.valueOf(sourceType.toUpperCase());
                JobSyncRun run = aggregationService.syncSource(st);
                return ResponseEntity.ok(Map.of(
                        "status", "Sync completed for " + st,
                        "jobsImported", String.valueOf(run.getJobsImported()),
                        "jobsUpdated", String.valueOf(run.getJobsUpdated())
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid source type: " + sourceType));
            }
        }

        aggregationService.syncAll();
        return ResponseEntity.ok(Map.of("status", "Sync triggered for all active sources"));
    }

    @Operation(summary = "Get sync run history",
            description = "View paginated sync operation audit logs")
    @GetMapping("/logs")
    public ResponseEntity<Page<JobSyncRun>> getSyncLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(syncRunRepository.findAllByOrderByStartedAtDesc(PageRequest.of(page, size)));
    }

    @Operation(summary = "Toggle job source",
            description = "Enable or disable an external job source")
    @PatchMapping("/sources/{id}/toggle")
    public ResponseEntity<JobSource> toggleSource(@PathVariable UUID id) {
        JobSource source = jobSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job source not found with ID: " + id));

        source.setIsActive(!source.getIsActive());
        jobSourceRepository.save(source);

        return ResponseEntity.ok(source);
    }

    @Operation(summary = "Get aggregation stats",
            description = "Detailed aggregation metrics including job counts by source and sync health")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", jobRepository.countByIsDeletedFalse());
        stats.put("hirehubJobs", jobRepository.countBySourceTypeAndIsDeletedFalse(SourceType.HIREHUB));
        stats.put("adzunaJobs", jobRepository.countBySourceTypeAndIsDeletedFalse(SourceType.ADZUNA));
        stats.put("greenhouseJobs", jobRepository.countBySourceTypeAndIsDeletedFalse(SourceType.GREENHOUSE));
        stats.put("leverJobs", jobRepository.countBySourceTypeAndIsDeletedFalse(SourceType.LEVER));
        stats.put("activeSources", jobSourceRepository.findByIsActiveAndIsDeletedFalse(true).size());
        return ResponseEntity.ok(stats);
    }
}

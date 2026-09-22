package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.dto.ExternalJobDto;
import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import com.hirehub.hirehub_backend.jobaggregation.service.JobAggregationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Phase 3: Real-Time Inbound Webhook Controller for external ATS/Job feeds.
 * Enables push-based job synchronization from Greenhouse, Lever, or custom job board crawlers.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class JobWebhookController {

    private final JobAggregationService jobAggregationService;

    @Value("${app.webhook.secret:hirehub-webhook-default-secret}")
    private String webhookSecret;

    @PostMapping("/jobs")
    public ResponseEntity<?> receiveJobWebhook(
            @RequestHeader(value = "X-HireHub-Webhook-Secret", required = false) String providedSecret,
            @RequestBody List<ExternalJobDto> jobs) {

        // Validate webhook authentication token if secret is configured
        if (webhookSecret != null && !webhookSecret.isBlank() && !webhookSecret.equals("hirehub-webhook-default-secret")) {
            if (providedSecret == null || !providedSecret.equals(webhookSecret)) {
                log.warn("[JobWebhookController] Unauthorized webhook push attempt. Invalid secret header.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "Unauthorized",
                        "message", "Invalid or missing X-HireHub-Webhook-Secret header"
                ));
            }
        }

        if (jobs == null || jobs.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Request body must contain at least one external job object"
            ));
        }

        log.info("[JobWebhookController] Received real-time push containing {} jobs", jobs.size());
        JobSyncRun run = jobAggregationService.ingestJobs(SourceType.WEBHOOK, jobs);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "sourceType", run.getSourceType().name(),
                "jobsFound", run.getJobsFound(),
                "jobsImported", run.getJobsImported(),
                "jobsUpdated", run.getJobsUpdated(),
                "jobsSkipped", run.getJobsSkipped(),
                "durationMs", run.getDurationMs()
        ));
    }

    @PostMapping("/job")
    public ResponseEntity<?> receiveSingleJobWebhook(
            @RequestHeader(value = "X-HireHub-Webhook-Secret", required = false) String providedSecret,
            @RequestBody ExternalJobDto singleJob) {

        if (singleJob == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job payload cannot be null"));
        }

        return receiveJobWebhook(providedSecret, Collections.singletonList(singleJob));
    }
}

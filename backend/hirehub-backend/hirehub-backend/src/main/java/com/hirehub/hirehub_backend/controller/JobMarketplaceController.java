package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.job.MarketplaceStatsDTO;
import com.hirehub.hirehub_backend.dto.job.UnifiedJobDTO;
import com.hirehub.hirehub_backend.entity.JobSource;
import com.hirehub.hirehub_backend.repository.JobSourceRepository;
import com.hirehub.hirehub_backend.service.JobMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Unified Job Marketplace REST API.
 * <p>
 * Merges internal (recruiter-posted) and external (aggregated) jobs
 * into a single, searchable marketplace with AI recommendations.
 */
@Tag(name = "Marketplace", description = "Unified job marketplace combining internal and external job sources")
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class JobMarketplaceController {

    private final JobMarketplaceService marketplaceService;
    private final JobSourceRepository jobSourceRepository;

    @Operation(summary = "Search marketplace jobs",
            description = "Unified search across internal recruiter-posted jobs and external aggregated jobs with filtering and pagination")
    @GetMapping("/jobs")
    public ResponseEntity<Page<UnifiedJobDTO>> searchMarketplace(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String sourceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        UUID candidateId = jwt != null ? UUID.fromString(jwt.getSubject()) : null;

        return ResponseEntity.ok(marketplaceService.searchMarketplace(
                keyword, location, workMode, employmentType, experienceLevel, sourceType,
                pageable, candidateId));
    }

    @Operation(summary = "Get marketplace job details",
            description = "Get full job details from any source (internal or external)")
    @GetMapping("/jobs/{id}")
    public ResponseEntity<UnifiedJobDTO> getJobById(
            @PathVariable UUID id,
            @RequestParam(required = false) String sourceType,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(marketplaceService.getJobById(id));
    }

    @Operation(summary = "Get AI-recommended jobs",
            description = "AI-powered personalized job recommendations for authenticated candidates based on skills, experience, and semantic matching")
    @GetMapping("/jobs/recommended")
    public ResponseEntity<List<UnifiedJobDTO>> getRecommendedJobs(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "10") int limit) {

        if (jwt == null) {
            // Return most recent jobs for unauthenticated users
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            return ResponseEntity.ok(marketplaceService.searchMarketplace(
                    null, null, null, null, null, null, pageable, null).getContent());
        }

        UUID candidateId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(marketplaceService.getRecommendations(candidateId, limit));
    }

    @Operation(summary = "Get active job sources",
            description = "List all configured external job sources and their health status")
    @GetMapping("/sources")
    public ResponseEntity<List<JobSource>> getJobSources() {
        return ResponseEntity.ok(jobSourceRepository.findByIsDeletedFalse());
    }

    @Operation(summary = "Get marketplace statistics",
            description = "Aggregation health metrics including total jobs by source, last sync time, and active source count")
    @GetMapping("/stats")
    public ResponseEntity<MarketplaceStatsDTO> getStats() {
        return ResponseEntity.ok(marketplaceService.getStats());
    }
}

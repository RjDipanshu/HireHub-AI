package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobResponseDTO;
import com.hirehub.hirehub_backend.dto.job.SavedJobResponseDTO;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.service.JobService;
import com.hirehub.hirehub_backend.service.SavedJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Tag(name = "Jobs", description = "Job postings management, search, filtering, and candidate bookmarks")
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final SavedJobService savedJobService;

    @Operation(summary = "Create a job posting", description = "Allows recruiters to publish a new job opportunity")
    @PostMapping
    public ResponseEntity<JobResponseDTO> createJob(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody JobRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(supabaseUserId, dto));
    }

    @Operation(summary = "Search and filter jobs", description = "Public multi-criteria job search with pagination, salary ranges, and work mode filters")
    @GetMapping
    public ResponseEntity<Page<JobResponseDTO>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        return ResponseEntity.ok(jobService.searchJobs(
                keyword, location, workMode, employmentType, experienceLevel, minSalary, maxSalary, status, pageable, null
        ));
    }

    @Operation(summary = "Get job details", description = "Retrieves full job description, company profile, and requirements")
    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJobById(id, null));
    }

    @Operation(summary = "Update job posting", description = "Updates job details for recruiter-owned posting")
    @PutMapping("/{id}")
    public ResponseEntity<JobResponseDTO> updateJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody JobRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobService.updateJob(id, supabaseUserId, dto));
    }

    @Operation(summary = "Update job status", description = "Changes job publishing lifecycle status (DRAFT, PUBLISHED, CLOSED, ARCHIVED)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponseDTO> updateJobStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam JobStatus status) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobService.updateJobStatus(id, supabaseUserId, status));
    }

    @Operation(summary = "Delete job", description = "Soft deletes job posting")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        jobService.deleteJob(id, supabaseUserId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all jobs for administration", description = "Admin view of all jobs across all employers")
    @GetMapping("/admin/all")
    public ResponseEntity<List<JobResponseDTO>> getAllJobsAdmin() {
        return ResponseEntity.ok(jobService.getAllJobsAdmin());
    }

    @Operation(summary = "Moderate job posting", description = "Admin moderation action to approve, reject, or flag a job posting")
    @PatchMapping("/{id}/moderate")
    public ResponseEntity<JobResponseDTO> moderateJob(
            @PathVariable UUID id,
            @RequestParam JobStatus status) {
        return ResponseEntity.ok(jobService.moderateJob(id, status));
    }

    @Operation(summary = "Get current recruiter's posted jobs", description = "Retrieves all jobs created by the authenticated recruiter")
    @GetMapping("/recruiter/my-jobs")
    public ResponseEntity<List<JobResponseDTO>> getMyJobs(@AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobService.getJobsByRecruiter(supabaseUserId));
    }

    @Operation(summary = "Get jobs by company", description = "Retrieves active jobs for a specific company profile")
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobResponseDTO>> getJobsByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    // --- Saved Jobs (Candidate Bookmarks) ---

    @Operation(summary = "Bookmark job", description = "Saves a job posting to candidate's saved jobs list")
    @PostMapping("/{id}/save")
    public ResponseEntity<SavedJobResponseDTO> saveJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(savedJobService.saveJob(supabaseUserId, id));
    }

    @Operation(summary = "Remove bookmark", description = "Removes a saved job from candidate's bookmarks")
    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        savedJobService.unsaveJob(supabaseUserId, id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get saved jobs", description = "Retrieves candidate's bookmarked job postings")
    @GetMapping("/saved")
    public ResponseEntity<List<SavedJobResponseDTO>> getMySavedJobs(@AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(savedJobService.getSavedJobs(supabaseUserId));
    }
}

package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.application.JobApplicationRequestDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationResponseDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationStatusUpdateDTO;
import com.hirehub.hirehub_backend.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponseDTO> applyForJob(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody JobApplicationRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobApplicationService.applyForJob(supabaseUserId, dto));
    }

    @PostMapping({"/jobs/{jobId}/apply-external", "/job/{jobId}/apply-external"})
    public ResponseEntity<JobApplicationResponseDTO> trackExternalApplication(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobApplicationService.trackExternalApplication(supabaseUserId, jobId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<JobApplicationResponseDTO>> getMyApplications(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobApplicationService.getCandidateApplications(supabaseUserId));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<List<JobApplicationResponseDTO>> getRecruiterApplications(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobApplicationService.getRecruiterApplications(supabaseUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponseDTO> getApplicationById(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = jwt != null && jwt.getSubject() != null ? UUID.fromString(jwt.getSubject()) : null;
        return ResponseEntity.ok(jobApplicationService.getApplicationById(id, supabaseUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        jobApplicationService.withdrawApplication(id, supabaseUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationResponseDTO>> getApplicationsByJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobApplicationService.getApplicationsByJob(jobId, supabaseUserId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponseDTO> updateApplicationStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody JobApplicationStatusUpdateDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, supabaseUserId, dto));
    }

    @PatchMapping("/{id}/viewed")
    public ResponseEntity<JobApplicationResponseDTO> markApplicationViewed(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobApplicationService.markApplicationViewed(id, supabaseUserId));
    }
}

package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.ai.ApplicantRankingResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.CoverLetterRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.CoverLetterResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.InterviewPrepRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.InterviewPrepResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.JobDescriptionGenerateDTO;
import com.hirehub.hirehub_backend.dto.ai.JobDescriptionResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticCandidateMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticJobMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticSearchRequestDTO;
import com.hirehub.hirehub_backend.service.AiService;
import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.service.JobMatchingService;
import com.hirehub.hirehub_backend.service.ResumeAnalysisService;
import com.hirehub.hirehub_backend.service.SemanticSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final ResumeAnalysisService resumeAnalysisService;
    private final JobMatchingService jobMatchingService;
    private final SemanticSearchService semanticSearchService;
    private final com.hirehub.hirehub_backend.service.AiMetricsService aiMetricsService;

    @GetMapping("/metrics")
    public ResponseEntity<com.hirehub.hirehub_backend.dto.ai.AiMetricsDTO> getAiMetrics() {
        return ResponseEntity.ok(aiMetricsService.getMetrics());
    }

    @PostMapping("/semantic/jobs")
    public ResponseEntity<List<SemanticJobMatchDTO>> searchJobsSemantically(
            @RequestBody SemanticSearchRequestDTO request) {
        return ResponseEntity.ok(semanticSearchService.searchJobsSemantically(request));
    }

    @PostMapping("/semantic/candidates")
    public ResponseEntity<List<SemanticCandidateMatchDTO>> searchCandidatesSemantically(
            @RequestBody SemanticSearchRequestDTO request) {
        return ResponseEntity.ok(semanticSearchService.searchCandidatesSemantically(request));
    }

    @PostMapping("/job-match/{jobId}")
    public ResponseEntity<JobMatchResponseDTO> matchJob(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID jobId) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(jobMatchingService.matchJob(supabaseUserId, jobId));
    }

    @PostMapping("/resume-analysis")
    public ResponseEntity<ResumeAnalysisResponseDTO> analyzeResume(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ResumeAnalysisRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(resumeAnalysisService.analyzeAndPersistResume(supabaseUserId, dto));
    }

    @PostMapping(value = "/resume-analysis/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeAnalysisResponseDTO> analyzeResumeUpload(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "jobId", required = false) UUID jobId,
            @RequestParam(value = "targetRole", required = false) String targetRole) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(resumeAnalysisService.analyzeUploadedPdfAndPersist(supabaseUserId, file, jobId, targetRole));
    }

    @GetMapping("/resume-analysis/{resumeId}")
    public ResponseEntity<ResumeAnalysisResponseDTO> getResumeAnalysis(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID resumeId) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(resumeAnalysisService.getLatestAnalysisByResume(supabaseUserId, resumeId));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<CoverLetterResponseDTO> generateCoverLetter(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CoverLetterRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(aiService.generateCoverLetter(supabaseUserId, dto));
    }

    @PostMapping("/interview-prep")
    public ResponseEntity<InterviewPrepResponseDTO> generateInterviewPrep(
            @Valid @RequestBody InterviewPrepRequestDTO dto) {
        return ResponseEntity.ok(aiService.generateInterviewPrep(dto));
    }

    @GetMapping("/rank-applicants/{jobId}")
    public ResponseEntity<ApplicantRankingResponseDTO> rankApplicants(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(aiService.rankApplicants(jobId, supabaseUserId));
    }

    @PostMapping("/job-description")
    public ResponseEntity<JobDescriptionResponseDTO> generateJobDescription(
            @Valid @RequestBody JobDescriptionGenerateDTO dto) {
        return ResponseEntity.ok(aiService.generateJobDescription(dto));
    }
}

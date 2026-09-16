package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.assessment.AssessmentResultDTO;
import com.hirehub.hirehub_backend.dto.assessment.AssessmentSubmissionDTO;
import com.hirehub.hirehub_backend.dto.assessment.SkillAssessmentDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillBadgeDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.service.SkillAssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class SkillAssessmentController {

    private final SkillAssessmentService skillAssessmentService;
    private final CandidateProfileRepository candidateProfileRepository;

    private CandidateProfile resolveCurrentCandidate(Jwt jwt) {
        if (jwt != null) {
            try {
                UUID supabaseUserId = UUID.fromString(jwt.getSubject());
                return candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                        .orElse(null);
            } catch (Exception ignored) {}
        }
        // Fallback for local testing/dev if JWT is absent
        List<CandidateProfile> profiles = candidateProfileRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        return profiles.isEmpty() ? null : profiles.get(0);
    }

    @GetMapping
    public ResponseEntity<List<SkillAssessmentDTO>> getAllAssessments(@AuthenticationPrincipal Jwt jwt) {
        CandidateProfile currentCandidate = resolveCurrentCandidate(jwt);
        UUID profileId = currentCandidate != null ? currentCandidate.getId() : null;
        return ResponseEntity.ok(skillAssessmentService.getAllAssessments(profileId));
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<SkillAssessmentDTO> getAssessmentQuestions(@PathVariable String topicId) {
        return ResponseEntity.ok(skillAssessmentService.getAssessmentQuestions(topicId));
    }

    @PostMapping("/{topicId}/submit")
    public ResponseEntity<AssessmentResultDTO> submitAssessment(
            @PathVariable String topicId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AssessmentSubmissionDTO submission) {
        submission.setTopicId(topicId);
        CandidateProfile currentCandidate = resolveCurrentCandidate(jwt);
        if (currentCandidate == null) {
            throw new RuntimeException("Candidate profile not found to record assessment badge");
        }
        return ResponseEntity.ok(skillAssessmentService.evaluateAssessment(currentCandidate.getId(), submission));
    }

    @GetMapping("/badges/me")
    public ResponseEntity<List<CandidateSkillBadgeDTO>> getMyBadges(@AuthenticationPrincipal Jwt jwt) {
        CandidateProfile currentCandidate = resolveCurrentCandidate(jwt);
        if (currentCandidate == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(skillAssessmentService.getCandidateBadges(currentCandidate.getId()));
    }

    @GetMapping("/badges/candidate/{candidateId}")
    public ResponseEntity<List<CandidateSkillBadgeDTO>> getCandidateBadges(@PathVariable UUID candidateId) {
        return ResponseEntity.ok(skillAssessmentService.getCandidateBadges(candidateId));
    }
}

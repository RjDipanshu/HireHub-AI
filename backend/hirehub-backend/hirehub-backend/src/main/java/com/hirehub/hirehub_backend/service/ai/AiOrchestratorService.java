package com.hirehub.hirehub_backend.service.ai;

import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.service.JobMatchingService;
import com.hirehub.hirehub_backend.service.SemanticSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Central AI Orchestration Layer.
 * <p>
 * Routes AI requests to the appropriate subsystem:
 * - Candidate-Job Matching across all marketplace jobs
 * - Skill Analysis & Extraction
 * - Job Summarization
 * - Skill Gap Analysis
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiOrchestratorService {

    private final JobMatchingService jobMatchingService;
    private final SemanticSearchService semanticSearchService;

    /**
     * Match an authenticated candidate against any job listing.
     */
    public JobMatchResponseDTO matchCandidateToJob(UUID supabaseUserId, Job job) {
        return jobMatchingService.matchJob(supabaseUserId, job.getId());
    }

    /**
     * Compute a lightweight match score for ranking purposes.
     * Uses semantic embedding similarity or skill overlap for fast scoring.
     */
    public int computeQuickMatchScore(CandidateProfile candidate, Job job) {
        if (candidate.getEmbeddingJson() == null || job.getEmbeddingJson() == null) {
            return computeSkillOverlapScore(candidate, job);
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Double> candidateVec = om.readValue(candidate.getEmbeddingJson(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<Double>>() {});
            List<Double> jobVec = om.readValue(job.getEmbeddingJson(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<Double>>() {});

            double similarity = semanticSearchService.computeCosineSimilarity(candidateVec, jobVec);
            return Math.min(99, Math.max(10, (int) Math.round(similarity * 100)));
        } catch (Exception e) {
            log.debug("Could not compute embedding match, falling back to skill overlap: {}", e.getMessage());
            return computeSkillOverlapScore(candidate, job);
        }
    }

    /**
     * Simple skill overlap score when embeddings are unavailable.
     */
    private int computeSkillOverlapScore(CandidateProfile candidate, Job job) {
        if (candidate.getCandidateSkills() == null || job.getSkills() == null || job.getSkills().isEmpty()) {
            return 60; // Neutral default
        }

        List<String> candidateSkills = candidate.getCandidateSkills().stream()
                .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                .map(cs -> cs.getSkill().getName().toLowerCase())
                .collect(Collectors.toList());

        List<String> jobSkills = job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName().toLowerCase())
                .collect(Collectors.toList());

        if (jobSkills.isEmpty()) return 60;

        long matching = jobSkills.stream().filter(candidateSkills::contains).count();
        int score = (int) Math.round((double) matching / jobSkills.size() * 100);
        return Math.min(99, Math.max(10, score));
    }
}

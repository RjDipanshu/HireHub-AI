package com.hirehub.hirehub_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.ai.SemanticCandidateMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticJobMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticSearchRequestDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemanticSearchService {

    private final GeminiService geminiService;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 12.0 Semantic Job Search: Natural language intent-based job discovery.
     */
    public List<SemanticJobMatchDTO> searchJobsSemantically(SemanticSearchRequestDTO request) {
        String query = request.getQuery();
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        List<Double> queryEmbedding = geminiService.generateEmbedding(query);
        List<Job> activeJobs = jobRepository.findAll().stream()
                .filter(j -> !Boolean.TRUE.equals(j.getIsDeleted()))
                .filter(j -> j.getStatus() == JobStatus.ACTIVE)
                .collect(Collectors.toList());

        List<SemanticJobMatchDTO> scoredJobs = new ArrayList<>();

        for (Job job : activeJobs) {
            List<Double> jobEmbedding = getOrCreateJobEmbedding(job);
            double similarity = computeCosineSimilarity(queryEmbedding, jobEmbedding);

            // Filter by minimum similarity score
            double threshold = request.getMinSimilarity() != null ? request.getMinSimilarity() : 0.20;
            if (similarity >= threshold || similarity > 0.10) {
                List<String> jobSkills = job.getSkills() != null
                        ? job.getSkills().stream().map(s -> s.getSkill().getName()).collect(Collectors.toList())
                        : Collections.emptyList();

                int matchPercentage = (int) Math.round(similarity * 100);

                scoredJobs.add(SemanticJobMatchDTO.builder()
                        .jobId(job.getId())
                        .title(job.getTitle())
                        .companyName(job.getCompany() != null ? job.getCompany().getName() : "Enterprise Partner")
                        .location(job.getLocation())
                        .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : "FULL_TIME")
                        .workMode(job.getWorkMode() != null ? job.getWorkMode().name() : "REMOTE")
                        .similarityScore(Math.round(similarity * 100.0) / 100.0)
                        .matchPercentage(Math.min(99, Math.max(15, matchPercentage)))
                        .matchRationale(buildJobMatchRationale(query, job, similarity))
                        .matchingSkills(jobSkills)
                        .missingSkills(Collections.emptyList())
                        .build());
            }
        }

        // Sort descending by semantic similarity score
        scoredJobs.sort(Comparator.comparingDouble(SemanticJobMatchDTO::getSimilarityScore).reversed());

        int limit = request.getLimit() != null && request.getLimit() > 0 ? request.getLimit() : 10;
        return scoredJobs.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * 13.0 Semantic Candidate Search: Natural language recruiter talent scouting.
     */
    public List<SemanticCandidateMatchDTO> searchCandidatesSemantically(SemanticSearchRequestDTO request) {
        String query = request.getQuery();
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        List<Double> queryEmbedding = geminiService.generateEmbedding(query);
        List<CandidateProfile> candidates = candidateProfileRepository.findAll().stream()
                .filter(cp -> !Boolean.TRUE.equals(cp.getIsDeleted()))
                .collect(Collectors.toList());

        List<SemanticCandidateMatchDTO> scoredCandidates = new ArrayList<>();

        for (CandidateProfile candidate : candidates) {
            List<Double> candidateEmbedding = getOrCreateCandidateEmbedding(candidate);
            double similarity = computeCosineSimilarity(queryEmbedding, candidateEmbedding);

            double threshold = request.getMinSimilarity() != null ? request.getMinSimilarity() : 0.20;
            if (similarity >= threshold || similarity > 0.10) {
                List<String> verifiedSkills = candidate.getCandidateSkills() != null
                        ? candidate.getCandidateSkills().stream()
                        .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                        .map(s -> s.getSkill().getName())
                        .collect(Collectors.toList())
                        : Collections.emptyList();

                String candidateName = candidate.getUser() != null
                        ? candidate.getUser().getFirstName() + " " + candidate.getUser().getLastName()
                        : "Verified Candidate";

                int matchPercentage = (int) Math.round(similarity * 100);

                scoredCandidates.add(SemanticCandidateMatchDTO.builder()
                        .candidateProfileId(candidate.getId())
                        .candidateName(candidateName)
                        .headline(candidate.getHeadline())
                        .currentLocation(candidate.getCurrentLocation())
                        .yearsOfExperience(candidate.getYearsOfExperience())
                        .similarityScore(Math.round(similarity * 100.0) / 100.0)
                        .matchPercentage(Math.min(99, Math.max(20, matchPercentage)))
                        .matchRationale(buildCandidateMatchRationale(query, candidate, similarity))
                        .matchingSkills(verifiedSkills.stream().limit(4).collect(Collectors.toList()))
                        .verifiedSkills(verifiedSkills)
                        .build());
            }
        }

        // Sort descending by semantic similarity score
        scoredCandidates.sort(Comparator.comparingDouble(SemanticCandidateMatchDTO::getSimilarityScore).reversed());

        int limit = request.getLimit() != null && request.getLimit() > 0 ? request.getLimit() : 10;
        return scoredCandidates.stream().limit(limit).collect(Collectors.toList());
    }

    private List<Double> getOrCreateJobEmbedding(Job job) {
        if (job.getEmbeddingJson() != null && !job.getEmbeddingJson().isBlank()) {
            try {
                return objectMapper.readValue(job.getEmbeddingJson(), new TypeReference<List<Double>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse existing job embedding JSON: {}", e.getMessage());
            }
        }

        // Generate embedding from job description, title, requirements and skills
        StringBuilder sb = new StringBuilder();
        sb.append(job.getTitle()).append(" ");
        if (job.getDescription() != null) sb.append(job.getDescription()).append(" ");
        if (job.getRequirements() != null) sb.append(job.getRequirements()).append(" ");
        if (job.getSkills() != null) {
            job.getSkills().forEach(s -> sb.append(s.getSkill().getName()).append(" "));
        }

        List<Double> vector = geminiService.generateEmbedding(sb.toString());
        try {
            job.setEmbeddingJson(objectMapper.writeValueAsString(vector));
            jobRepository.save(job);
        } catch (Exception e) {
            log.warn("Could not cache job embedding: {}", e.getMessage());
        }
        return vector;
    }

    private List<Double> getOrCreateCandidateEmbedding(CandidateProfile candidate) {
        if (candidate.getEmbeddingJson() != null && !candidate.getEmbeddingJson().isBlank()) {
            try {
                return objectMapper.readValue(candidate.getEmbeddingJson(), new TypeReference<List<Double>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse existing candidate embedding JSON: {}", e.getMessage());
            }
        }

        StringBuilder sb = new StringBuilder();
        if (candidate.getHeadline() != null) sb.append(candidate.getHeadline()).append(" ");
        if (candidate.getBio() != null) sb.append(candidate.getBio()).append(" ");
        if (candidate.getCandidateSkills() != null) {
            candidate.getCandidateSkills().forEach(s -> sb.append(s.getSkill().getName()).append(" "));
        }
        if (candidate.getExperiences() != null) {
            candidate.getExperiences().forEach(exp -> sb.append(exp.getJobTitle()).append(" ").append(exp.getDescription()).append(" "));
        }

        List<Double> vector = geminiService.generateEmbedding(sb.toString());
        try {
            candidate.setEmbeddingJson(objectMapper.writeValueAsString(vector));
            candidateProfileRepository.save(candidate);
        } catch (Exception e) {
            log.warn("Could not cache candidate embedding: {}", e.getMessage());
        }
        return vector;
    }

    /**
     * Computes the Cosine Similarity between two 768-dimensional normalized vectors.
     * Value ranges between 0.0 (orthogonal/unrelated) and 1.0 (identical intent).
     */
    public double computeCosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1 == null || v2 == null || v1.isEmpty() || v2.isEmpty()) {
            return 0.0;
        }

        int size = Math.min(v1.size(), v2.size());
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < size; i++) {
            double a = v1.get(i);
            double b = v2.get(i);
            dotProduct += a * b;
            norm1 += a * a;
            norm2 += b * b;
        }

        double denom = Math.sqrt(norm1) * Math.sqrt(norm2);
        if (denom <= 0.0) return 0.0;

        double similarity = dotProduct / denom;
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    private String buildJobMatchRationale(String query, Job job, double similarity) {
        return String.format("High semantic alignment (%.0f%% match) with query concepts. Role relates directly to %s engineering.",
                similarity * 100, job.getTitle());
    }

    private String buildCandidateMatchRationale(String query, CandidateProfile candidate, double similarity) {
        return String.format("Candidate background matches %.0f%% of requested talent criteria with documented experience as '%s'.",
                similarity * 100, candidate.getHeadline() != null ? candidate.getHeadline() : "Software Professional");
    }
}

package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.jobmatching.dto.JobMatchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Backward compatibility facade delegating to the unified jobmatching module.
 */
@Service
@Primary
@RequiredArgsConstructor
public class JobMatchingService {

    private final com.hirehub.hirehub_backend.jobmatching.service.JobMatchingService delegate;

    public JobMatchResponseDTO matchJob(UUID supabaseUserId, UUID jobId) {
        JobMatchResponse resp = delegate.matchJob(supabaseUserId, jobId);
        JobMatchResponseDTO dto = new JobMatchResponseDTO();
        dto.setJobId(resp.getJobId());
        dto.setJobTitle(resp.getJobTitle());
        dto.setCompanyName(resp.getCompanyName());
        dto.setOverallMatchScore(resp.getMatchScore());
        dto.setRecommendation(resp.getRecommendation());
        dto.setMissingSkills(resp.getMissingSkills());
        dto.setMatchingSkills(resp.getMatchingSkills());
        dto.setExplanation(resp.getMatchRationale());
        dto.setMatchedAt(LocalDateTime.now());
        dto.setModelUsed("gemini-1.5-flash");

        Map<String, Integer> categoryScores = new HashMap<>();
        categoryScores.put("skills", resp.getSkillsScore());
        categoryScores.put("experience", resp.getExperienceScore());
        categoryScores.put("location", resp.getLocationScore());
        dto.setCategoryScores(categoryScores);

        dto.setMatchLevel(resp.getMatchScore() >= 85 ? "EXCELLENT" : resp.getMatchScore() >= 70 ? "GOOD" : "MODERATE");

        return dto;
    }

    public JobMatchResponse matchJobStructured(UUID supabaseUserId, UUID jobId) {
        return delegate.matchJob(supabaseUserId, jobId);
    }
}

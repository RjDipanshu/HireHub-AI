package com.hirehub.hirehub_backend.jobmatching.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.jobmatching.dto.JobMatchResponse;
import com.hirehub.hirehub_backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchExplanationService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    /**
     * Produces structured match score breakdown and missing skills analysis.
     */
    public JobMatchResponse computeMatchBreakdown(
            String candidateContext,
            Job job,
            List<String> candidateSkills,
            List<String> requiredSkills
    ) {
        String prompt = buildPrompt(candidateContext, job, candidateSkills, requiredSkills);

        try {
            String rawJson = geminiService.generateContent(prompt);
            return parseAiResponse(rawJson, job, candidateSkills, requiredSkills);
        } catch (Exception e) {
            log.warn("[MatchExplanationService] Gemini scoring notice, computing deterministic heuristic match: {}", e.getMessage());
            return computeHeuristicMatch(job, candidateSkills, requiredSkills);
        }
    }

    private String buildPrompt(String candidateContext, Job job, List<String> candidateSkills, List<String> requiredSkills) {
        return """
                You are an expert AI Technical Recruiter. Evaluate candidate fit for the target role.
                Return ONLY valid JSON matching this exact structure:
                {
                  "matchScore": 88,
                  "skillsScore": 92,
                  "experienceScore": 85,
                  "locationScore": 100,
                  "matchingSkills": ["Java", "Spring Boot"],
                  "missingSkills": ["AWS", "Docker"],
                  "matchRationale": "Strong backend background with core Java expertise; minor gap in containerization.",
                  "recommendation": "HIGHLY_RECOMMENDED"
                }

                Candidate:
                %s

                Job:
                Title: %s
                Company: %s
                Location: %s
                Workplace: %s
                Required Skills: %s
                Description: %s
                """.formatted(
                candidateContext,
                job.getTitle(),
                job.getEffectiveCompanyName(),
                job.getLocation(),
                job.getWorkMode(),
                String.join(", ", requiredSkills),
                job.getDescription() != null ? job.getDescription().substring(0, Math.min(1500, job.getDescription().length())) : ""
        );
    }

    private JobMatchResponse parseAiResponse(String rawResponse, Job job, List<String> candidateSkills, List<String> requiredSkills) {
        try {
            String cleaned = rawResponse.trim();
            if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
            if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
            if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length() - 3);

            JsonNode node = objectMapper.readTree(cleaned.trim());

            int matchScore = node.path("matchScore").asInt(80);
            int skillsScore = node.path("skillsScore").asInt(matchScore);
            int experienceScore = node.path("experienceScore").asInt(matchScore);
            int locationScore = node.path("locationScore").asInt(100);

            List<String> matchingSkills = new ArrayList<>();
            if (node.has("matchingSkills") && node.path("matchingSkills").isArray()) {
                node.path("matchingSkills").forEach(n -> matchingSkills.add(n.asText()));
            }

            List<String> missingSkills = new ArrayList<>();
            if (node.has("missingSkills") && node.path("missingSkills").isArray()) {
                node.path("missingSkills").forEach(n -> missingSkills.add(n.asText()));
            }

            String rationale = node.path("matchRationale").asText("Solid overall technical and domain alignment.");
            String rec = node.path("recommendation").asText("RECOMMENDED");

            return JobMatchResponse.builder()
                    .jobId(job.getId())
                    .jobTitle(job.getTitle())
                    .companyName(job.getEffectiveCompanyName())
                    .matchScore(Math.min(99, Math.max(15, matchScore)))
                    .skillsScore(Math.min(100, Math.max(10, skillsScore)))
                    .experienceScore(Math.min(100, Math.max(10, experienceScore)))
                    .locationScore(Math.min(100, Math.max(10, locationScore)))
                    .matchingSkills(matchingSkills)
                    .missingSkills(missingSkills)
                    .matchRationale(rationale)
                    .recommendation(rec)
                    .build();

        } catch (Exception e) {
            log.warn("[MatchExplanationService] Could not parse AI response JSON: {}", e.getMessage());
            return computeHeuristicMatch(job, candidateSkills, requiredSkills);
        }
    }

    private JobMatchResponse computeHeuristicMatch(Job job, List<String> candidateSkills, List<String> requiredSkills) {
        List<String> candidateLower = candidateSkills.stream().map(String::toLowerCase).collect(Collectors.toList());

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            if (candidateLower.contains(req.toLowerCase())) {
                matching.add(req);
            } else {
                missing.add(req);
            }
        }

        int skillsScore = requiredSkills.isEmpty() ? 75 : (int) Math.round(((double) matching.size() / requiredSkills.size()) * 100);
        int matchScore = Math.max(30, Math.min(96, skillsScore));

        return JobMatchResponse.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getEffectiveCompanyName())
                .matchScore(matchScore)
                .skillsScore(skillsScore)
                .experienceScore(80)
                .locationScore(100)
                .matchingSkills(matching)
                .missingSkills(missing)
                .matchRationale("Evaluated based on profile technical competencies and required role skills.")
                .recommendation(matchScore >= 80 ? "HIGHLY_RECOMMENDED" : matchScore >= 60 ? "RECOMMENDED" : "PARTIAL_MATCH")
                .build();
    }
}

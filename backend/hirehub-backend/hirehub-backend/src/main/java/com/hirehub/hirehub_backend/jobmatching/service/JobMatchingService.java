package com.hirehub.hirehub_backend.jobmatching.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.jobmatching.dto.JobMatchRequest;
import com.hirehub.hirehub_backend.jobmatching.dto.JobMatchResponse;
import com.hirehub.hirehub_backend.jobmatching.entity.JobMatch;
import com.hirehub.hirehub_backend.jobmatching.repository.JobMatchRepository;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service("unifiedJobMatchingService")
@RequiredArgsConstructor
public class JobMatchingService {

    private final CandidateContextService candidateContextService;
    private final MatchExplanationService matchExplanationService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;
    private final JobMatchRepository jobMatchRepository;
    private final ObjectMapper objectMapper;

    /**
     * Matches candidate against a job and persists the match evaluation.
     */
    @Transactional
    public JobMatchResponse matchJob(UUID supabaseUserId, UUID jobId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        String candidateContext = candidateContextService.buildCandidateContext(candidate, null);
        List<String> candidateSkills = candidateContextService.extractCandidateSkills(candidate);

        List<String> requiredSkills = job.getSkills() != null
                ? job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName())
                .collect(Collectors.toList())
                : new ArrayList<>();

        JobMatchResponse response = matchExplanationService.computeMatchBreakdown(
                candidateContext, job, candidateSkills, requiredSkills);

        persistMatchEvaluation(candidate, job, response);

        return response;
    }

    /**
     * Matches candidate using a JobMatchRequest DTO.
     */
    @Transactional
    public JobMatchResponse evaluateMatch(JobMatchRequest request) {
        CandidateProfile candidate = candidateProfileRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found with ID: " + request.getCandidateId()));

        Job job = jobRepository.findByIdAndIsDeletedFalse(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + request.getJobId()));

        String candidateContext = candidateContextService.buildCandidateContext(candidate, request.getCustomResumeText());
        List<String> candidateSkills = candidateContextService.extractCandidateSkills(candidate);

        List<String> requiredSkills = job.getSkills() != null
                ? job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName())
                .collect(Collectors.toList())
                : new ArrayList<>();

        JobMatchResponse response = matchExplanationService.computeMatchBreakdown(
                candidateContext, job, candidateSkills, requiredSkills);

        persistMatchEvaluation(candidate, job, response);

        return response;
    }

    private void persistMatchEvaluation(CandidateProfile candidate, Job job, JobMatchResponse response) {
        try {
            Optional<JobMatch> existingOpt = jobMatchRepository.findByCandidateIdAndJobIdAndIsDeletedFalse(
                    candidate.getId(), job.getId());

            JobMatch match = existingOpt.orElseGet(() -> JobMatch.builder()
                    .candidate(candidate)
                    .job(job)
                    .build());

            match.setMatchScore(response.getMatchScore());
            match.setSkillsScore(response.getSkillsScore());
            match.setExperienceScore(response.getExperienceScore());
            match.setLocationScore(response.getLocationScore());
            match.setMatchRationale(response.getMatchRationale());
            match.setEvaluatedAt(LocalDateTime.now());

            if (response.getMissingSkills() != null) {
                match.setMissingSkillsJson(objectMapper.writeValueAsString(response.getMissingSkills()));
            }
            if (response.getMatchingSkills() != null) {
                match.setMatchingSkillsJson(objectMapper.writeValueAsString(response.getMatchingSkills()));
            }

            jobMatchRepository.save(match);
        } catch (Exception e) {
            log.warn("[JobMatchingService] Could not persist match evaluation: {}", e.getMessage());
        }
    }
}

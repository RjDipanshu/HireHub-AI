package com.hirehub.hirehub_backend.jobmatching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Structured AI Job Match response delivering numeric breakdown scores
 * and actionable skill gaps.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchResponse {

    private UUID jobId;
    private String jobTitle;
    private String companyName;

    /**
     * Overall match score (0-100).
     */
    private int matchScore;

    /**
     * Skill alignment score (0-100).
     */
    private int skillsScore;

    /**
     * Experience level alignment score (0-100).
     */
    private int experienceScore;

    /**
     * Location / workplace mode alignment score (0-100).
     */
    private int locationScore;

    /**
     * Skills the candidate possesses that the job requires.
     */
    @Builder.Default
    private List<String> matchingSkills = new ArrayList<>();

    /**
     * Required job skills missing from the candidate's profile/resume.
     */
    @Builder.Default
    private List<String> missingSkills = new ArrayList<>();

    /**
     * 1-2 sentence executive explanation of the score.
     */
    private String matchRationale;

    /**
     * Hiring recommendation (e.g. HIGHLY_RECOMMENDED, GOOD_MATCH, PARTIAL_MATCH).
     */
    private String recommendation;
}

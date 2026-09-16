package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchResponseDTO {

    private UUID jobId;
    private String jobTitle;
    private String companyName;

    // 0 - 100 Overall Fit Score
    private int overallMatchScore;
    private String matchLevel; // "EXCELLENT", "GOOD", "MODERATE", "LOW"

    // 5 Category Scores: skills, experience, education, projects, keywords
    @Builder.Default
    private Map<String, Integer> categoryScores = new HashMap<>();

    @Builder.Default
    private List<String> matchingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> missingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> gaps = new ArrayList<>();

    private String recommendation; // "HIGHLY_RECOMMENDED", "RECOMMENDED", "CONSIDER_WITH_UPSKILLING", "NOT_RECOMMENDED"
    private String explanation;
    private String modelUsed;
    private LocalDateTime matchedAt;
    private String fairnessDisclaimer;
}

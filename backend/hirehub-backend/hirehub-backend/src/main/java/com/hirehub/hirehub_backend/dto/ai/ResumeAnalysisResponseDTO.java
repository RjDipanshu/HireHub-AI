package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponseDTO {

    private UUID resumeId;
    private UUID jobId;
    private String jobTitle;

    // ATS Score (0 - 100)
    private int matchScore;
    private Integer overallScore;
    private String matchLevel; // "High", "Medium", "Low"
    private String summary;

    // Detected & Structured Skills
    @Builder.Default
    private List<String> detectedSkills = new ArrayList<>();

    @Builder.Default
    private List<String> technicalSkills = new ArrayList<>();

    @Builder.Default
    private List<String> softSkills = new ArrayList<>();

    @Builder.Default
    private List<String> matchingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> missingSkills = new ArrayList<>();

    // Structured Sections Extracted
    @Builder.Default
    private List<String> education = new ArrayList<>();

    @Builder.Default
    private List<String> experience = new ArrayList<>();

    @Builder.Default
    private List<String> projects = new ArrayList<>();

    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    // Feedback & Issues
    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> formattingIssues = new ArrayList<>();

    @Builder.Default
    private List<String> atsCompatibilityIssues = new ArrayList<>();

    @Builder.Default
    private List<String> suggestions = new ArrayList<>();

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    // 5-Factor Dimensions
    private int skillsMatchScore;      // e.g. 88%
    private int experienceMatchScore;  // e.g. 76%
    private int educationMatchScore;   // e.g. 92%
    private int keywordsScore;         // e.g. 81%
    private int formattingScore;       // e.g. 90%

    // Categorized Recommendations
    @Builder.Default
    private List<String> skillRecommendations = new ArrayList<>();

    @Builder.Default
    private List<String> keywordRecommendations = new ArrayList<>();

    @Builder.Default
    private List<String> experienceImprovements = new ArrayList<>();

    @Builder.Default
    private List<String> missingSections = new ArrayList<>();

    private String modelUsed;
    private LocalDateTime analyzedAt;
}

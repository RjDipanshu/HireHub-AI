package com.hirehub.hirehub_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resume_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysis extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore = 0;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "technical_skills", columnDefinition = "TEXT")
    private String technicalSkills;

    @Column(name = "soft_skills", columnDefinition = "TEXT")
    private String softSkills;

    @Column(name = "education_json", columnDefinition = "TEXT")
    private String educationJson;

    @Column(name = "experience_json", columnDefinition = "TEXT")
    private String experienceJson;

    @Column(name = "projects_json", columnDefinition = "TEXT")
    private String projectsJson;

    @Column(name = "certifications_json", columnDefinition = "TEXT")
    private String certificationsJson;

    @Column(name = "keywords_json", columnDefinition = "TEXT")
    private String keywordsJson;

    @Column(name = "strengths_json", columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(name = "weaknesses_json", columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(name = "missing_skills_json", columnDefinition = "TEXT")
    private String missingSkillsJson;

    @Column(name = "formatting_issues_json", columnDefinition = "TEXT")
    private String formattingIssuesJson;

    @Column(name = "ats_compatibility_issues_json", columnDefinition = "TEXT")
    private String atsCompatibilityIssuesJson;

    @Column(name = "suggestions_json", columnDefinition = "TEXT")
    private String suggestionsJson;

    @Column(name = "model_used", length = 50)
    private String modelUsed = "gemini-1.5-flash";
}

package com.hirehub.hirehub_backend.jobmatching.entity;

import com.hirehub.hirehub_backend.entity.BaseEntity;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobMatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "match_score", nullable = false)
    private int matchScore;

    @Column(name = "skills_score")
    private int skillsScore;

    @Column(name = "experience_score")
    private int experienceScore;

    @Column(name = "location_score")
    private int locationScore;

    @Column(name = "missing_skills_json", columnDefinition = "TEXT")
    private String missingSkillsJson;

    @Column(name = "matching_skills_json", columnDefinition = "TEXT")
    private String matchingSkillsJson;

    @Column(name = "match_rationale", columnDefinition = "TEXT")
    private String matchRationale;

    @Column(name = "evaluated_at", nullable = false)
    private LocalDateTime evaluatedAt;
}

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

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_skill_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkillBadge extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "badge_title", nullable = false, length = 150)
    private String badgeTitle;

    @Column(nullable = false)
    private Double score;

    @Column(name = "is_passed", nullable = false)
    private Boolean isPassed = true;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt = LocalDateTime.now();
}

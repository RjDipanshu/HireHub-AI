package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.ProficiencyLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidate_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    private CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false)
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.INTERMEDIATE;

    @Column(name = "years_of_experience")
    private Double yearsOfExperience = 0.0;
}

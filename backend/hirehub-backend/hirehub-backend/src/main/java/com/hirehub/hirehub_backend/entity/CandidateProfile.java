package com.hirehub.hirehub_backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 200)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String phone;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "years_of_experience")
    private Double yearsOfExperience = 0.0;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "notice_period", length = 50)
    private String noticePeriod;

    @Column(name = "current_ctc")
    private Double currentCtc;

    @Column(name = "expected_ctc")
    private Double expectedCtc;

    @Column(name = "preferred_locations", length = 255)
    private String preferredLocations;

    @Column(name = "is_phone_verified")
    private Boolean isPhoneVerified = true;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = true;

    @Column(name = "is_identity_verified")
    private Boolean isIdentityVerified = true;

    @Column(name = "is_top_talent_badge")
    private Boolean isTopTalentBadge = false;

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CandidateSkill> candidateSkills = new ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Resume> resumes = new ArrayList<>();

    @Column(name = "embedding_json", columnDefinition = "TEXT")
    private String embeddingJson;
}

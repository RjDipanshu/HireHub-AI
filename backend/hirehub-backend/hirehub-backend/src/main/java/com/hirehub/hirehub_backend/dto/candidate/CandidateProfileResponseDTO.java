package com.hirehub.hirehub_backend.dto.candidate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileResponseDTO {

    private UUID id;
    private UUID userId;
    private UUID supabaseUserId;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageUrl;
    private String headline;
    private String bio;
    private String phone;
    private String currentLocation;
    private Double yearsOfExperience;
    private String websiteUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String noticePeriod;
    private Double currentCtc;
    private Double expectedCtc;
    private String preferredLocations;
    private Boolean isPhoneVerified = true;
    private Boolean isEmailVerified = true;
    private Boolean isIdentityVerified = true;
    private Boolean isTopTalentBadge = false;

    private List<EducationDTO> educations = new ArrayList<>();
    private List<ExperienceDTO> experiences = new ArrayList<>();
    private List<CandidateSkillDTO> skills = new ArrayList<>();
    private List<ResumeDTO> resumes = new ArrayList<>();
    private List<CandidateSkillBadgeDTO> skillBadges = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

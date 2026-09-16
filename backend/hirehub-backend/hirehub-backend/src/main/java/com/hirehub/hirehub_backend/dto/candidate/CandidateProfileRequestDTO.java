package com.hirehub.hirehub_backend.dto.candidate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileRequestDTO {

    private UUID userId;

    @Size(max = 50, message = "First name must be under 50 characters")
    private String firstName;

    @Size(max = 50, message = "Last name must be under 50 characters")
    private String lastName;

    private String profileImageUrl;

    @Size(max = 200, message = "Headline must be under 200 characters")
    private String headline;

    private String bio;

    @Size(max = 25, message = "Phone number must be under 25 characters")
    private String phone;

    @Size(max = 100, message = "Location must be under 100 characters")
    private String currentLocation;

    @DecimalMin(value = "0.0", message = "Years of experience must be 0 or greater")
    private Double yearsOfExperience;

    private String websiteUrl;

    private String githubUrl;

    private String linkedinUrl;

    private String portfolioUrl;

    private String noticePeriod;

    private Double currentCtc;

    private Double expectedCtc;

    private String preferredLocations;
    private Boolean isPhoneVerified;
    private Boolean isEmailVerified;
    private Boolean isIdentityVerified;
    private Boolean isTopTalentBadge;

    private List<EducationDTO> educations;

    private List<ExperienceDTO> experiences;

    private List<CandidateSkillDTO> skills;
}


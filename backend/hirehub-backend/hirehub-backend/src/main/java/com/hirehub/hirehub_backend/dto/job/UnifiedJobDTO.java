package com.hirehub.hirehub_backend.dto.job;

import com.hirehub.hirehub_backend.enums.SourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Unified job DTO that combines fields from both internal (recruiter-posted)
 * and external (aggregated) job listings for a consistent marketplace experience.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedJobDTO {

    private UUID id;
    private String title;
    private String description;
    private String responsibilities;
    private String requirements;

    // Company info
    private String companyName;
    private UUID companyId;

    // Recruiter info (internal jobs only)
    private UUID recruiterId;
    private String recruiterName;

    // Job details
    private String employmentType;
    private String workMode;
    private String experienceLevel;
    private Integer minExperienceYears;
    private Integer maxExperienceYears;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private String location;
    private String status;
    private LocalDateTime deadline;

    // Skills
    private List<String> skills;

    // Source tracking
    private SourceType sourceType;
    private String applicationUrl;
    private String sourceLogoUrl;

    // AI enrichment
    private Integer matchScore;
    private String matchRationale;
    private String summary;

    // Candidate state (when authenticated)
    private Boolean isSaved;
    private Boolean isApplied;

    // Metadata
    private Integer applicantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

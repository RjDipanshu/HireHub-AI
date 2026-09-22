package com.hirehub.hirehub_backend.dto.application;

import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponseDTO {

    private UUID id;

    // Job details
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogoUrl;
    private String jobLocation;
    private WorkMode workMode;
    private EmploymentType employmentType;

    // Candidate details
    private UUID candidateProfileId;
    private UUID userId;
    private String candidateFirstName;
    private String candidateLastName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateHeadline;
    private String candidateProfileImageUrl;

    // Resume details
    private UUID resumeId;
    private String resumeUrl;
    private Double atsScore;

    // Application details
    private ApplicationStatus status;
    private com.hirehub.hirehub_backend.enums.ApplicationSource applicationSource;
    private String externalJobId;
    private String applicationUrl;
    private String coverLetter;
    private String feedback;
    private String rejectionReason;
    private java.util.Map<String, String> screeningAnswers;
    private LocalDateTime viewedByRecruiterAt;

    private LocalDateTime appliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

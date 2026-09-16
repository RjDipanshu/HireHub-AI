package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.application.JobApplicationRequestDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationResponseDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationStatusUpdateDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.JobApplication;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import com.hirehub.hirehub_backend.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ResumeRepository resumeRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;
    private final AlertNotificationService alertNotificationService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Transactional
    public JobApplicationResponseDTO applyForJob(UUID candidateSupabaseUserId, JobApplicationRequestDTO dto) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user: " + candidateSupabaseUserId));

        Job job = jobRepository.findByIdAndIsDeletedFalse(dto.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + dto.getJobId()));

        // Guardrails: Job must be ACTIVE
        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new RuntimeException("Cannot apply to a job that is not active (current status: " + job.getStatus() + ")");
        }

        // Guardrails: Check deadline if set
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            throw new RuntimeException("The application deadline for this job has passed");
        }

        // Guardrails: Check duplicate application
        if (jobApplicationRepository.existsByJobIdAndCandidateIdAndIsDeletedFalse(job.getId(), candidate.getId())) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Resume lookup
        Resume resume = null;
        if (dto.getResumeId() != null) {
            resume = resumeRepository.findByIdAndIsDeletedFalse(dto.getResumeId())
                    .orElseThrow(() -> new RuntimeException("Resume not found with ID: " + dto.getResumeId()));
        } else {
            // Fallback to primary resume if exists
            resume = resumeRepository.findByCandidateProfileIdAndIsPrimaryTrueAndIsDeletedFalse(candidate.getId())
                    .orElse(null);
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setResume(resume);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setCoverLetter(dto.getCoverLetter());
        if (dto.getScreeningAnswers() != null && !dto.getScreeningAnswers().isEmpty()) {
            try {
                application.setScreeningAnswersJson(objectMapper.writeValueAsString(dto.getScreeningAnswers()));
            } catch (Exception ignored) {}
        }
        application.setIsDeleted(false);

        JobApplication saved = jobApplicationRepository.save(application);

        // Phase 11.2 & 11.4: In-App Notifications and Email Triggers
        try {
            String companyName = job.getCompany() != null ? job.getCompany().getName() : "Partner Employer";
            String candidateName = (candidate.getUser() != null && candidate.getUser().getFirstName() != null ? candidate.getUser().getFirstName() + " " + (candidate.getUser().getLastName() != null ? candidate.getUser().getLastName() : "") : "Candidate").trim();

            if (candidate.getUser() != null) {
                notificationService.createNotification(
                        candidate.getUser(),
                        "Application Submitted: " + job.getTitle(),
                        "Your application for " + job.getTitle() + " at " + companyName + " was received successfully.",
                        NotificationType.APPLICATION_RECEIVED,
                        "/candidate/applications"
                );
                if (candidate.getUser().getEmail() != null) {
                    emailNotificationService.sendApplicationSubmittedEmail(
                            candidate.getUser().getEmail(),
                            candidateName,
                            job.getTitle(),
                            companyName
                    );
                }
            }

            if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
                notificationService.createNotification(
                        job.getRecruiter().getUser(),
                        "New Applicant: " + job.getTitle(),
                        candidateName + " has applied for " + job.getTitle() + ".",
                        NotificationType.APPLICATION_RECEIVED,
                        "/recruiter/applications"
                );
                if (job.getRecruiter().getUser().getEmail() != null) {
                    emailNotificationService.sendRecruiterNewApplicationEmail(
                            job.getRecruiter().getUser().getEmail(),
                            candidateName,
                            job.getTitle()
                    );
                }
            }
        } catch (Exception ignored) {}

        return convertToDTO(saved);
    }

    public List<JobApplicationResponseDTO> getCandidateApplications(UUID candidateSupabaseUserId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        return jobApplicationRepository.findByCandidateIdAndIsDeletedFalseOrderByCreatedAtDesc(candidate.getId())
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<JobApplicationResponseDTO> getApplicationsByJob(UUID jobId, UUID recruiterSupabaseUserId) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        // Verify recruiter owns job or is in same company
        if (!job.getRecruiter().getId().equals(recruiter.getId()) &&
                (recruiter.getCompany() == null || !job.getCompany().getId().equals(recruiter.getCompany().getId()))) {
            throw new RuntimeException("You are not authorized to view applications for this job");
        }

        return jobApplicationRepository.findByJobIdAndIsDeletedFalseOrderByCreatedAtDesc(jobId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<JobApplicationResponseDTO> getRecruiterApplications(UUID recruiterSupabaseUserId) {
        return recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .map(recruiter -> {
                    if (recruiter.getCompany() != null) {
                        return jobApplicationRepository.findByJobCompanyIdAndIsDeletedFalseOrderByCreatedAtDesc(recruiter.getCompany().getId())
                                .stream().map(this::convertToDTO).collect(Collectors.toList());
                    } else {
                        return jobApplicationRepository.findByJobRecruiterIdAndIsDeletedFalseOrderByCreatedAtDesc(recruiter.getId())
                                .stream().map(this::convertToDTO).collect(Collectors.toList());
                    }
                })
                .orElseGet(Collections::emptyList);
    }

    public JobApplicationResponseDTO getApplicationById(UUID applicationId) {
        return getApplicationById(applicationId, null);
    }

    public JobApplicationResponseDTO getApplicationById(UUID applicationId, UUID supabaseUserId) {
        JobApplication application = jobApplicationRepository.findByIdAndIsDeletedFalse(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + applicationId));

        // Object-level authorization check: candidate who applied OR recruiter for the job OR admin
        if (supabaseUserId != null) {
            boolean isCandidate = application.getCandidate() != null
                    && application.getCandidate().getUser() != null
                    && supabaseUserId.equals(application.getCandidate().getUser().getSupabaseUserId());

            boolean isRecruiter = application.getJob() != null
                    && application.getJob().getRecruiter() != null
                    && application.getJob().getRecruiter().getUser() != null
                    && supabaseUserId.equals(application.getJob().getRecruiter().getUser().getSupabaseUserId());

            User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId).orElse(null);
            boolean isAdmin = user != null && user.getRole() != null && RoleType.ADMIN.equals(user.getRole().getName());

            if (!isCandidate && !isRecruiter && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view this application");
            }

            if (isRecruiter && application.getViewedByRecruiterAt() == null) {
                application.setViewedByRecruiterAt(java.time.LocalDateTime.now());
                application = jobApplicationRepository.save(application);
            }
        }

        return convertToDTO(application);
    }

    @Transactional
    public JobApplicationResponseDTO markApplicationViewed(UUID applicationId, UUID recruiterSupabaseUserId) {
        JobApplication application = jobApplicationRepository.findByIdAndIsDeletedFalse(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + applicationId));
        if (application.getViewedByRecruiterAt() == null) {
            application.setViewedByRecruiterAt(java.time.LocalDateTime.now());
            application = jobApplicationRepository.save(application);
        }
        return convertToDTO(application);
    }

    @Transactional
    public JobApplicationResponseDTO updateApplicationStatus(
            UUID applicationId,
            UUID recruiterSupabaseUserId,
            JobApplicationStatusUpdateDTO dto
    ) {
        JobApplication application = jobApplicationRepository.findByIdAndIsDeletedFalse(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + applicationId));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        Job job = application.getJob();
        if (!job.getRecruiter().getId().equals(recruiter.getId()) &&
                (recruiter.getCompany() == null || !job.getCompany().getId().equals(recruiter.getCompany().getId()))) {
            throw new RuntimeException("You are not authorized to update applications for this job");
        }

        application.setStatus(dto.getStatus());
        if (dto.getFeedback() != null) {
            application.setFeedback(dto.getFeedback());
        }
        if (dto.getRejectionReason() != null) {
            application.setRejectionReason(dto.getRejectionReason());
        }

        JobApplication updated = jobApplicationRepository.save(application);

        // Phase 3 & 11.5: Application status change alerts (In-App, WhatsApp, Email)
        try {
            alertNotificationService.triggerApplicationStatusAlert(updated, dto.getStatus().name());
            CandidateProfile candidate = application.getCandidate();
            if (candidate != null && candidate.getUser() != null) {
                String companyName = job.getCompany() != null ? job.getCompany().getName() : "Partner Employer";
                String candidateName = (candidate.getUser() != null && candidate.getUser().getFirstName() != null ? candidate.getUser().getFirstName() : "Candidate").trim();
                String statusTitle = "Application Update: " + dto.getStatus();
                String statusMsg = "Your application for " + job.getTitle() + " at " + companyName + " is now " + dto.getStatus() + ".";

                if (dto.getStatus() == ApplicationStatus.SHORTLISTED) {
                    statusTitle = "Application Shortlisted!";
                    statusMsg = "Congratulations! Your application for " + job.getTitle() + " at " + companyName + " has been shortlisted.";
                    if (candidate.getUser().getEmail() != null) {
                        emailNotificationService.sendApplicationShortlistedEmail(
                                candidate.getUser().getEmail(),
                                candidateName,
                                job.getTitle(),
                                companyName
                        );
                    }
                } else if (dto.getStatus() == ApplicationStatus.REJECTED) {
                    statusTitle = "Application Status Update";
                    statusMsg = "Thank you for your interest in " + job.getTitle() + " at " + companyName + ". The team has decided to move forward with other applicants.";
                    if (candidate.getUser().getEmail() != null) {
                        emailNotificationService.sendApplicationRejectedEmail(
                                candidate.getUser().getEmail(),
                                candidateName,
                                job.getTitle(),
                                companyName
                        );
                    }
                }

                notificationService.createNotification(
                        candidate.getUser(),
                        statusTitle,
                        statusMsg,
                        NotificationType.APPLICATION_STATUS_UPDATED,
                        "/candidate/applications"
                );
            }
        } catch (Exception ignored) {}

        return convertToDTO(updated);
    }

    @Transactional
    public void withdrawApplication(UUID applicationId, UUID candidateSupabaseUserId) {
        JobApplication application = jobApplicationRepository.findByIdAndIsDeletedFalse(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + applicationId));

        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("You can only withdraw your own applications");
        }

        application.setIsDeleted(true);
        jobApplicationRepository.save(application);
    }

    public JobApplicationResponseDTO convertToDTO(JobApplication app) {
        Job job = app.getJob();
        CandidateProfile candidate = app.getCandidate();
        Resume resume = app.getResume();

        UUID resumeId = resume != null ? resume.getId() : null;
        String resumeUrl = resume != null ? resume.getFileUrl() : null;
        Double atsScore = resume != null ? resume.getAtsScore() : null;

        String compName = job.getCompany() != null ? job.getCompany().getName() : null;
        String compLogo = job.getCompany() != null ? job.getCompany().getLogoUrl() : null;

        java.util.Map<String, String> screeningAnswers = new java.util.HashMap<>();
        if (app.getScreeningAnswersJson() != null && !app.getScreeningAnswersJson().isBlank()) {
            try {
                screeningAnswers = objectMapper.readValue(
                        app.getScreeningAnswersJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {}
                );
            } catch (Exception ignored) {}
        }

        return new JobApplicationResponseDTO(
                app.getId(),
                job.getId(),
                job.getTitle(),
                compName,
                compLogo,
                job.getLocation(),
                job.getWorkMode(),
                job.getEmploymentType(),
                candidate.getId(),
                candidate.getUser().getId(),
                candidate.getUser().getFirstName(),
                candidate.getUser().getLastName(),
                candidate.getUser().getEmail(),
                candidate.getUser().getPhone(),
                candidate.getHeadline(),
                candidate.getUser().getProfileImageUrl(),
                resumeId,
                resumeUrl,
                atsScore,
                app.getStatus(),
                app.getCoverLetter(),
                app.getFeedback(),
                app.getRejectionReason(),
                screeningAnswers,
                app.getViewedByRecruiterAt(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }
}

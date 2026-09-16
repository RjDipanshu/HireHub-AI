package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.communication.InterviewRequestDTO;
import com.hirehub.hirehub_backend.dto.communication.InterviewResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Interview;
import com.hirehub.hirehub_backend.entity.JobApplication;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import com.hirehub.hirehub_backend.enums.InterviewStatus;
import com.hirehub.hirehub_backend.enums.NotificationType;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.InterviewRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public InterviewResponseDTO scheduleInterview(UUID recruiterSupabaseUserId, InterviewRequestDTO dto) {
        JobApplication application = jobApplicationRepository.findByIdAndIsDeletedFalse(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + dto.getApplicationId()));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId()) &&
                (recruiter.getCompany() == null || !application.getJob().getCompany().getId().equals(recruiter.getCompany().getId()))) {
            throw new RuntimeException("You are not authorized to schedule an interview for this application");
        }

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        jobApplicationRepository.save(application);

        // Create Interview record
        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setRecruiter(recruiter);
        interview.setCandidate(application.getCandidate());
        interview.setScheduledAt(dto.getScheduledAt());
        interview.setDurationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 45);
        interview.setMeetingLink(dto.getMeetingLink() != null ? dto.getMeetingLink() : "https://meet.google.com/new");
        interview.setInterviewType(dto.getInterviewType());
        interview.setStatus(InterviewStatus.SCHEDULED);
        interview.setRecruiterNotes(dto.getRecruiterNotes());
        interview.setIsDeleted(false);

        Interview saved = interviewRepository.save(interview);

        // Dispatch notification and email to candidate
        String dateFormatted = dto.getScheduledAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
        notificationService.createNotification(
                application.getCandidate().getUser(),
                "Interview Scheduled: " + application.getJob().getTitle(),
                "Your " + dto.getInterviewType() + " interview with " + application.getJob().getCompany().getName() +
                        " has been scheduled for " + dateFormatted + ". Check your dashboard for details.",
                NotificationType.INTERVIEW_SCHEDULED,
                "/candidate/interviews"
        );

        if (application.getCandidate().getUser() != null && application.getCandidate().getUser().getEmail() != null) {
            String candidateName = (application.getCandidate().getUser().getFirstName() != null ? application.getCandidate().getUser().getFirstName() : "Candidate").trim();
            emailNotificationService.sendInterviewScheduledEmail(
                    application.getCandidate().getUser().getEmail(),
                    candidateName,
                    application.getJob().getTitle(),
                    application.getJob().getCompany().getName(),
                    dateFormatted,
                    interview.getMeetingLink()
            );
        }

        return convertToDTO(saved);
    }

    @Transactional
    public InterviewResponseDTO rescheduleInterview(UUID interviewId, UUID recruiterSupabaseUserId, LocalDateTime newTime, String newLink) {
        Interview interview = interviewRepository.findByIdAndIsDeletedFalse(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with ID: " + interviewId));

        interview.setScheduledAt(newTime);
        if (newLink != null && !newLink.isBlank()) {
            interview.setMeetingLink(newLink);
        }
        interview.setStatus(InterviewStatus.RESCHEDULED);
        Interview updated = interviewRepository.save(interview);

        String dateFormatted = newTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
        notificationService.createNotification(
                interview.getCandidate().getUser(),
                "Interview Rescheduled: " + interview.getApplication().getJob().getTitle(),
                "Your interview has been rescheduled to " + dateFormatted + ".",
                NotificationType.INTERVIEW_SCHEDULED,
                "/candidate/interviews"
        );

        return convertToDTO(updated);
    }

    @Transactional
    public InterviewResponseDTO cancelInterview(UUID interviewId, UUID recruiterSupabaseUserId, String reason) {
        Interview interview = interviewRepository.findByIdAndIsDeletedFalse(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with ID: " + interviewId));

        interview.setStatus(InterviewStatus.CANCELLED);
        if (reason != null) {
            interview.setRecruiterNotes((interview.getRecruiterNotes() != null ? interview.getRecruiterNotes() + " | Cancellation Reason: " : "Cancellation Reason: ") + reason);
        }
        Interview updated = interviewRepository.save(interview);

        notificationService.createNotification(
                interview.getCandidate().getUser(),
                "Interview Cancelled: " + interview.getApplication().getJob().getTitle(),
                "Your scheduled interview has been cancelled. Reason: " + (reason != null ? reason : "Scheduling conflict."),
                NotificationType.INTERVIEW_CANCELLED,
                "/candidate/interviews"
        );

        return convertToDTO(updated);
    }

    @Transactional
    public InterviewResponseDTO completeInterview(UUID interviewId, UUID recruiterSupabaseUserId, String feedback) {
        Interview interview = interviewRepository.findByIdAndIsDeletedFalse(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with ID: " + interviewId));

        interview.setStatus(InterviewStatus.COMPLETED);
        if (feedback != null) {
            interview.setRecruiterNotes((interview.getRecruiterNotes() != null ? interview.getRecruiterNotes() + " | Post-Interview Feedback: " : "Post-Interview Feedback: ") + feedback);
        }
        Interview updated = interviewRepository.save(interview);
        return convertToDTO(updated);
    }

    public List<InterviewResponseDTO> getMyInterviewsAsCandidate(UUID candidateSupabaseUserId) {
        return candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .map(candidate -> interviewRepository.findByCandidateIdAndIsDeletedFalseOrderByScheduledAtDesc(candidate.getId())
                        .stream().map(this::convertToDTO).collect(Collectors.toList()))
                .orElseGet(Collections::emptyList);
    }

    public List<InterviewResponseDTO> getMyInterviewsAsRecruiter(UUID recruiterSupabaseUserId) {
        return recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .map(recruiter -> interviewRepository.findByRecruiterIdAndIsDeletedFalseOrderByScheduledAtDesc(recruiter.getId())
                        .stream().map(this::convertToDTO).collect(Collectors.toList()))
                .orElseGet(Collections::emptyList);
    }

    public InterviewResponseDTO getInterviewById(UUID interviewId) {
        Interview interview = interviewRepository.findByIdAndIsDeletedFalse(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with ID: " + interviewId));
        return convertToDTO(interview);
    }

    public InterviewResponseDTO convertToDTO(Interview interview) {
        JobApplication app = interview.getApplication();
        RecruiterProfile rec = interview.getRecruiter();
        CandidateProfile cand = interview.getCandidate();

        String recName = rec.getUser() != null ? rec.getUser().getFirstName() + " " + rec.getUser().getLastName() : "Recruiter";
        String recEmail = rec.getUser() != null ? rec.getUser().getEmail() : null;

        String candName = cand.getUser() != null ? cand.getUser().getFirstName() + " " + cand.getUser().getLastName() : "Candidate";
        String candEmail = cand.getUser() != null ? cand.getUser().getEmail() : null;
        String candPhone = cand.getUser() != null ? cand.getUser().getPhone() : null;

        return new InterviewResponseDTO(
                interview.getId(),
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : null,
                rec.getId(),
                recName,
                recEmail,
                cand.getId(),
                candName,
                candEmail,
                candPhone,
                interview.getScheduledAt(),
                interview.getDurationMinutes(),
                interview.getMeetingLink(),
                interview.getInterviewType(),
                interview.getStatus(),
                interview.getRecruiterNotes(),
                interview.getCandidateFeedback(),
                interview.getCreatedAt(),
                interview.getUpdatedAt()
        );
    }
}

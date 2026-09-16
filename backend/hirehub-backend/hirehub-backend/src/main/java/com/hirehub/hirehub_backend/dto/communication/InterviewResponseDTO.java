package com.hirehub.hirehub_backend.dto.communication;

import com.hirehub.hirehub_backend.enums.InterviewStatus;
import com.hirehub.hirehub_backend.enums.InterviewType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponseDTO {

    private UUID id;
    private UUID applicationId;
    private UUID jobId;
    private String jobTitle;
    private String companyName;

    private UUID recruiterId;
    private String recruiterName;
    private String recruiterEmail;

    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;

    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private InterviewType interviewType;
    private InterviewStatus status;

    private String recruiterNotes;
    private String candidateFeedback;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

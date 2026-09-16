package com.hirehub.hirehub_backend.dto.communication;

import com.hirehub.hirehub_backend.enums.InterviewType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequestDTO {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @NotNull(message = "Scheduled date and time is required")
    private LocalDateTime scheduledAt;

    private Integer durationMinutes = 45;

    private String meetingLink;

    private InterviewType interviewType = InterviewType.TECHNICAL;

    private String recruiterNotes;
}

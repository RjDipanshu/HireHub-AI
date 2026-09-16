package com.hirehub.hirehub_backend.dto.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationRequestDTO {

    @NotNull(message = "Job ID is required")
    private UUID jobId;

    private UUID resumeId;

    private String coverLetter;

    private java.util.Map<String, String> screeningAnswers;
}

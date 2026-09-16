package com.hirehub.hirehub_backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewPrepRequestDTO {

    @NotNull(message = "Job ID is required")
    private UUID jobId;

    private String focusArea; // "Technical", "Behavioral", "System Design", "All"
}

package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisRequestDTO {

    private UUID resumeId;

    private UUID jobId;

    private String resumeText;

    private String targetRole;
}

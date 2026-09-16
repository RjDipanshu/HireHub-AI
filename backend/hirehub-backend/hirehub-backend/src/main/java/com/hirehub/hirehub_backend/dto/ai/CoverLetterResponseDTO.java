package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterResponseDTO {

    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private String candidateName;
    private String generatedCoverLetter;
}

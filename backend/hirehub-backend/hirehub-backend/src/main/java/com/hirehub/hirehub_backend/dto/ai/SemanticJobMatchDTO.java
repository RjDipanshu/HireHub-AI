package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticJobMatchDTO {
    private UUID jobId;
    private String title;
    private String companyName;
    private String location;
    private String employmentType;
    private String workMode;
    private Double similarityScore; // 0.00 - 1.00
    private Integer matchPercentage; // 0 - 100
    private String matchRationale;
    private List<String> matchingSkills;
    private List<String> missingSkills;
}

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
public class SemanticCandidateMatchDTO {
    private UUID candidateProfileId;
    private String candidateName;
    private String headline;
    private String currentLocation;
    private Double yearsOfExperience;
    private Double similarityScore; // 0.00 - 1.00
    private Integer matchPercentage; // 0 - 100
    private String matchRationale;
    private List<String> matchingSkills;
    private List<String> verifiedSkills;
}

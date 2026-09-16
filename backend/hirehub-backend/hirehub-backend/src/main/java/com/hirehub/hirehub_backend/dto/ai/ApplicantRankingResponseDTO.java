package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantRankingResponseDTO {

    private UUID jobId;
    private String jobTitle;
    private int totalApplicantsEvaluated;
    private List<RankedApplicant> rankings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankedApplicant {
        private UUID applicationId;
        private UUID candidateId;
        private String candidateName;
        private String email;
        private String headline;
        private int matchScore; // 0-100
        private int rank;
        private String executiveSummary; // 3-bullet or short synthesis
        private List<String> keyStrengths;
        private List<String> missingSkills;
    }
}

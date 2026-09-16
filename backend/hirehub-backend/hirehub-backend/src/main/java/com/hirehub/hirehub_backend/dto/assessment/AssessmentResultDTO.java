package com.hirehub.hirehub_backend.dto.assessment;

import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillBadgeDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultDTO {
    private String topicId;
    private String title;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double scorePercentage;
    private Boolean passed;
    private String feedback;
    private CandidateSkillBadgeDTO badge;
}

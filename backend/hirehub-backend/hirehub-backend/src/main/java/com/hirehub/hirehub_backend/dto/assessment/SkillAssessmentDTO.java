package com.hirehub.hirehub_backend.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAssessmentDTO {
    private String topicId;
    private String title;
    private String category;
    private String description;
    private String icon;
    private Integer durationMinutes;
    private Integer passingScorePercentage;
    private Integer totalQuestions;
    private List<AssessmentQuestionDTO> questions;
    private Boolean alreadyPassed;
}

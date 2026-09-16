package com.hirehub.hirehub_backend.dto.assessment;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmissionDTO {
    @NotNull
    private String topicId;

    // Map of questionId -> selectedOptionIndex (0-indexed)
    @NotNull
    private Map<Integer, Integer> answers;
}

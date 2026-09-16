package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewPrepResponseDTO {

    private UUID jobId;
    private String jobTitle;
    private List<QuestionItem> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItem {
        private String category; // "Technical", "Behavioral", "Job-Specific", "Problem Solving"
        private String question;
        private String guidance;
        private String keyPointsToMention;
        private String suggestedAnswer;
    }
}

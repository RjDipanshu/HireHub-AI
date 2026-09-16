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
public class AssessmentQuestionDTO {
    private Integer id;
    private String question;
    private List<String> options;
}

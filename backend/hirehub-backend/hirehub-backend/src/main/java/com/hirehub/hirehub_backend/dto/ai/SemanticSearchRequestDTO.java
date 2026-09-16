package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticSearchRequestDTO {
    private String query;
    @Builder.Default
    private Integer limit = 10;
    @Builder.Default
    private Double minSimilarity = 0.50;
    private List<String> requiredSkills;
    private String location;
    private String workMode;
}

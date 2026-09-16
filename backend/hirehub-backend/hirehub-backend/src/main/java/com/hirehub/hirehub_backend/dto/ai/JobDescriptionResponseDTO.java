package com.hirehub.hirehub_backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionResponseDTO {

    private String title;
    private String summary;
    private String description;
    private List<String> responsibilities;
    private List<String> requirements;
    private List<String> suggestedSkills;
}

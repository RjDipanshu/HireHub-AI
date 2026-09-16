package com.hirehub.hirehub_backend.dto.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillResponseDTO {

    private UUID id;
    private UUID skillId;
    private String skillName;
    private String category;
    private Boolean isRequired;
    private Integer minExperienceYears;
}

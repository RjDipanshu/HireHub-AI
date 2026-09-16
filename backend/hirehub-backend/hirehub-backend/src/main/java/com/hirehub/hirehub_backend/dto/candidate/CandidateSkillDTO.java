package com.hirehub.hirehub_backend.dto.candidate;

import com.hirehub.hirehub_backend.enums.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkillDTO {
    private UUID id;

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    private String skillName;

    private String skillCategory;

    @NotNull(message = "Proficiency level is required")
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.INTERMEDIATE;

    private Double yearsOfExperience = 0.0;
}

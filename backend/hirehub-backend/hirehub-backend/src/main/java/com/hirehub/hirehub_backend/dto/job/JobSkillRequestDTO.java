package com.hirehub.hirehub_backend.dto.job;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillRequestDTO {

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    private Boolean isRequired = true;

    private Integer minExperienceYears;
}

package com.hirehub.hirehub_backend.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDTO {
    private UUID id;

    @NotBlank(message = "Skill name is required")
    private String name;

    private String category;
}

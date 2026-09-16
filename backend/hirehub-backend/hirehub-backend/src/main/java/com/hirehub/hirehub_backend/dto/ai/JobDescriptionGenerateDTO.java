package com.hirehub.hirehub_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionGenerateDTO {

    @NotBlank(message = "Job title is required")
    private String title;

    private String industry;

    private String experienceLevel; // e.g. "Senior", "Entry Level"

    private List<String> keySkills;

    private String tone = "Professional"; // "Professional", "Innovative", "Startup"
}

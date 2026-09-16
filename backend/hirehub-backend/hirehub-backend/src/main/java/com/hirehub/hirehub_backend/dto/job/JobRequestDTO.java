package com.hirehub.hirehub_backend.dto.job;

import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequestDTO {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private String responsibilities;

    private String requirements;

    private UUID companyId;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    private ExperienceLevel experienceLevel;

    private Integer minExperienceYears;

    private Integer maxExperienceYears;

    private BigDecimal minSalary;

    private BigDecimal maxSalary;

    private String currency = "USD";

    private String location;

    private LocalDate deadline;

    private JobStatus status = JobStatus.ACTIVE;

    @Valid
    private List<JobSkillRequestDTO> skills = new ArrayList<>();

    private List<String> screeningQuestions = new ArrayList<>();
}

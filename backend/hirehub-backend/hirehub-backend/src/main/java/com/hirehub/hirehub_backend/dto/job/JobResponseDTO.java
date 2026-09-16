package com.hirehub.hirehub_backend.dto.job;

import com.hirehub.hirehub_backend.dto.recruiter.CompanyResponseDTO;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private String responsibilities;
    private String requirements;

    private CompanyResponseDTO company;

    private UUID recruiterId;
    private String recruiterName;
    private String recruiterEmail;

    private EmploymentType employmentType;
    private WorkMode workMode;
    private ExperienceLevel experienceLevel;
    private Integer minExperienceYears;
    private Integer maxExperienceYears;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private String location;

    private JobStatus status;
    private LocalDate deadline;

    private List<JobSkillResponseDTO> skills = new ArrayList<>();
    private List<String> screeningQuestions = new ArrayList<>();

    private int applicantCount;
    private boolean isSaved;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

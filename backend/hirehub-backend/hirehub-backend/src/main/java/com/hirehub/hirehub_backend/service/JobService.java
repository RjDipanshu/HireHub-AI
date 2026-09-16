package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobResponseDTO;
import com.hirehub.hirehub_backend.dto.job.JobSkillRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobSkillResponseDTO;
import com.hirehub.hirehub_backend.entity.Company;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.JobSkill;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.repository.CompanyRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.JobSkillRepository;
import com.hirehub.hirehub_backend.repository.JobSpecification;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import com.hirehub.hirehub_backend.repository.SavedJobRepository;
import com.hirehub.hirehub_backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final SkillRepository skillRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyService companyService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Transactional
    public JobResponseDTO createJob(UUID recruiterSupabaseUserId, JobRequestDTO dto) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found for user: " + recruiterSupabaseUserId));

        Company company;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findByIdAndIsDeletedFalse(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));
        } else if (recruiter.getCompany() != null) {
            company = recruiter.getCompany();
        } else {
            throw new RuntimeException("Recruiter is not associated with any company, and no company ID was provided");
        }

        Job job = new Job();
        job.setTitle(dto.getTitle().trim());
        job.setDescription(dto.getDescription());
        job.setResponsibilities(dto.getResponsibilities());
        job.setRequirements(dto.getRequirements());
        job.setRecruiter(recruiter);
        job.setCompany(company);
        job.setEmploymentType(dto.getEmploymentType());
        job.setWorkMode(dto.getWorkMode());
        job.setExperienceLevel(dto.getExperienceLevel());
        job.setMinExperienceYears(dto.getMinExperienceYears());
        job.setMaxExperienceYears(dto.getMaxExperienceYears());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        job.setLocation(dto.getLocation());
        job.setStatus(dto.getStatus() != null ? dto.getStatus() : JobStatus.ACTIVE);
        job.setDeadline(dto.getDeadline());
        if (dto.getScreeningQuestions() != null && !dto.getScreeningQuestions().isEmpty()) {
            try {
                job.setScreeningQuestionsJson(objectMapper.writeValueAsString(dto.getScreeningQuestions()));
            } catch (Exception ignored) {}
        }
        job.setIsDeleted(false);

        Job savedJob = jobRepository.save(job);

        // Attach skills if provided
        if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
            attachSkillsToJob(savedJob, dto.getSkills());
        }

        return convertToDTO(savedJob, null);
    }

    @Transactional
    public JobResponseDTO updateJob(UUID jobId, UUID recruiterSupabaseUserId, JobRequestDTO dto) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Authorization check: recruiter must own the job or belong to the same company
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId()) &&
                (recruiter.getCompany() == null || !job.getCompany().getId().equals(recruiter.getCompany().getId()))) {
            throw new RuntimeException("You are not authorized to update this job");
        }

        if (dto.getTitle() != null) job.setTitle(dto.getTitle().trim());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getResponsibilities() != null) job.setResponsibilities(dto.getResponsibilities());
        if (dto.getRequirements() != null) job.setRequirements(dto.getRequirements());
        if (dto.getEmploymentType() != null) job.setEmploymentType(dto.getEmploymentType());
        if (dto.getWorkMode() != null) job.setWorkMode(dto.getWorkMode());
        if (dto.getExperienceLevel() != null) job.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getMinExperienceYears() != null) job.setMinExperienceYears(dto.getMinExperienceYears());
        if (dto.getMaxExperienceYears() != null) job.setMaxExperienceYears(dto.getMaxExperienceYears());
        if (dto.getMinSalary() != null) job.setMinSalary(dto.getMinSalary());
        if (dto.getMaxSalary() != null) job.setMaxSalary(dto.getMaxSalary());
        if (dto.getCurrency() != null) job.setCurrency(dto.getCurrency());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());
        if (dto.getDeadline() != null) job.setDeadline(dto.getDeadline());
        if (dto.getScreeningQuestions() != null) {
            try {
                job.setScreeningQuestionsJson(objectMapper.writeValueAsString(dto.getScreeningQuestions()));
            } catch (Exception ignored) {}
        }

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findByIdAndIsDeletedFalse(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));
            job.setCompany(company);
        }

        // Replace skills if provided
        if (dto.getSkills() != null) {
            job.getSkills().clear();
            jobRepository.saveAndFlush(job);
            attachSkillsToJob(job, dto.getSkills());
        }

        Job updated = jobRepository.save(job);
        return convertToDTO(updated, null);
    }

    @Transactional
    public JobResponseDTO updateJobStatus(UUID jobId, UUID recruiterSupabaseUserId, JobStatus status) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        job.setStatus(status);
        Job updated = jobRepository.save(job);
        return convertToDTO(updated, null);
    }

    public JobResponseDTO getJobById(UUID jobId, UUID candidateProfileIdOpt) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));
        return convertToDTO(job, candidateProfileIdOpt);
    }

    public Page<JobResponseDTO> searchJobs(
            String keyword,
            String location,
            WorkMode workMode,
            EmploymentType employmentType,
            ExperienceLevel experienceLevel,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            JobStatus status,
            Pageable pageable,
            UUID candidateProfileIdOpt
    ) {
        Specification<Job> spec = JobSpecification.filterJobs(
                keyword, location, workMode, employmentType, experienceLevel, minSalary, maxSalary, status
        );

        return jobRepository.findAll(spec, pageable)
                .map(job -> convertToDTO(job, candidateProfileIdOpt));
    }

    public List<JobResponseDTO> getJobsByRecruiter(UUID recruiterSupabaseUserId) {
        return recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .map(recruiter -> jobRepository.findByRecruiterIdAndIsDeletedFalseOrderByCreatedAtDesc(recruiter.getId())
                        .stream().map(job -> convertToDTO(job, null)).collect(Collectors.toList()))
                .orElseGet(Collections::emptyList);
    }

    public List<JobResponseDTO> getJobsByCompany(UUID companyId) {
        return jobRepository.findByCompanyIdAndStatusAndIsDeletedFalse(companyId, JobStatus.ACTIVE)
                .stream().map(job -> convertToDTO(job, null)).collect(Collectors.toList());
    }

    @Transactional
    public void deleteJob(UUID jobId, UUID recruiterSupabaseUserId) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));
        job.setIsDeleted(true);
        jobRepository.save(job);
    }

    public List<JobResponseDTO> getAllJobsAdmin() {
        return jobRepository.findAll().stream()
                .filter(j -> !Boolean.TRUE.equals(j.getIsDeleted()))
                .map(j -> convertToDTO(j, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public JobResponseDTO moderateJob(UUID jobId, JobStatus status) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));
        job.setStatus(status);
        Job updated = jobRepository.save(job);
        return convertToDTO(updated, null);
    }

    public Job getJobEntityById(UUID jobId) {
        return jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));
    }

    private void attachSkillsToJob(Job job, List<JobSkillRequestDTO> skillDTOs) {
        List<JobSkill> jobSkills = new ArrayList<>();
        for (JobSkillRequestDTO sDto : skillDTOs) {
            Skill skill = skillRepository.findById(sDto.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found with ID: " + sDto.getSkillId()));

            JobSkill jobSkill = new JobSkill();
            jobSkill.setJob(job);
            jobSkill.setSkill(skill);
            jobSkill.setIsRequired(sDto.getIsRequired() != null ? sDto.getIsRequired() : true);
            jobSkill.setMinExperienceYears(sDto.getMinExperienceYears());
            jobSkill.setIsDeleted(false);
            jobSkills.add(jobSkill);
        }
        job.getSkills().addAll(jobSkills);
    }

    public JobResponseDTO convertToDTO(Job job, UUID candidateProfileIdOpt) {
        int applicantCount = jobApplicationRepository.countByJobIdAndIsDeletedFalse(job.getId());
        boolean isSaved = false;
        if (candidateProfileIdOpt != null) {
            isSaved = savedJobRepository.existsByCandidateIdAndJobIdAndIsDeletedFalse(candidateProfileIdOpt, job.getId());
        }

        List<JobSkillResponseDTO> skillsDTO = job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> new JobSkillResponseDTO(
                        js.getId(),
                        js.getSkill().getId(),
                        js.getSkill().getName(),
                        js.getSkill().getCategory(),
                        js.getIsRequired(),
                        js.getMinExperienceYears()
                ))
                .collect(Collectors.toList());

        String recruiterName = job.getRecruiter().getUser() != null
                ? job.getRecruiter().getUser().getFirstName() + " " + job.getRecruiter().getUser().getLastName()
                : "Recruiter";
        String recruiterEmail = job.getRecruiter().getUser() != null
                ? job.getRecruiter().getUser().getEmail()
                : null;

        List<String> screeningQuestions = new ArrayList<>();
        if (job.getScreeningQuestionsJson() != null && !job.getScreeningQuestionsJson().isBlank()) {
            try {
                screeningQuestions = objectMapper.readValue(
                        job.getScreeningQuestionsJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception ignored) {}
        }

        return new JobResponseDTO(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getResponsibilities(),
                job.getRequirements(),
                companyService.convertToDTO(job.getCompany()),
                job.getRecruiter().getId(),
                recruiterName,
                recruiterEmail,
                job.getEmploymentType(),
                job.getWorkMode(),
                job.getExperienceLevel(),
                job.getMinExperienceYears(),
                job.getMaxExperienceYears(),
                job.getMinSalary(),
                job.getMaxSalary(),
                job.getCurrency(),
                job.getLocation(),
                job.getStatus(),
                job.getDeadline(),
                skillsDTO,
                screeningQuestions,
                applicantCount,
                isSaved,
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}

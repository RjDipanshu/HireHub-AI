package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.job.MarketplaceStatsDTO;
import com.hirehub.hirehub_backend.dto.job.UnifiedJobDTO;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import com.hirehub.hirehub_backend.jobaggregation.repository.JobSyncRunRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.JobSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Unified Job Marketplace Service.
 * <p>
 * Manages the unified marketplace of jobs (both internal recruiter-posted
 * and external aggregated postings) stored directly in the primary Job entity.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobMarketplaceService {

    private final JobRepository jobRepository;
    private final JobSourceRepository jobSourceRepository;
    private final JobSyncRunRepository syncRunRepository;
    private final JobApplicationRepository jobApplicationRepository;

    /**
     * Unified search across all jobs with filtering and pagination.
     */
    public Page<UnifiedJobDTO> searchMarketplace(
            String keyword,
            String location,
            String workMode,
            String employmentType,
            String experienceLevel,
            String sourceType,
            Pageable pageable,
            UUID candidateSupabaseUserId
    ) {
        List<Job> allJobs = jobRepository.findAll().stream()
                .filter(j -> !Boolean.TRUE.equals(j.getIsDeleted()))
                .filter(j -> j.getStatus() == JobStatus.ACTIVE)
                .collect(Collectors.toList());

        List<UnifiedJobDTO> filtered = new ArrayList<>();

        for (Job job : allJobs) {
            // Source type filter
            if (sourceType != null && !sourceType.isBlank() && !"ALL".equalsIgnoreCase(sourceType)) {
                String jobSource = job.getSourceType() != null ? job.getSourceType().name() : "HIREHUB";
                if (!jobSource.equalsIgnoreCase(sourceType) &&
                        !("INTERNAL".equalsIgnoreCase(sourceType) && "HIREHUB".equalsIgnoreCase(jobSource))) {
                    continue;
                }
            }

            // Keyword filter
            if (keyword != null && !keyword.isBlank()) {
                String kw = keyword.toLowerCase();
                boolean matches = (job.getTitle() != null && job.getTitle().toLowerCase().contains(kw))
                        || (job.getDescription() != null && job.getDescription().toLowerCase().contains(kw))
                        || (job.getEffectiveCompanyName() != null && job.getEffectiveCompanyName().toLowerCase().contains(kw));
                if (!matches) continue;
            }

            // Location filter
            if (location != null && !location.isBlank()) {
                if (job.getLocation() == null || !job.getLocation().toLowerCase().contains(location.toLowerCase())) {
                    continue;
                }
            }

            // Workplace Type filter
            if (workMode != null && !workMode.isBlank()) {
                if (job.getWorkMode() == null || !job.getWorkMode().name().equalsIgnoreCase(workMode)) {
                    continue;
                }
            }

            // Employment Type filter
            if (employmentType != null && !employmentType.isBlank()) {
                if (job.getEmploymentType() == null || !job.getEmploymentType().name().equalsIgnoreCase(employmentType)) {
                    continue;
                }
            }

            // Experience Level filter
            if (experienceLevel != null && !experienceLevel.isBlank()) {
                if (job.getExperienceLevel() == null || !job.getExperienceLevel().name().equalsIgnoreCase(experienceLevel)) {
                    continue;
                }
            }

            filtered.add(convertToUnifiedJobDTO(job));
        }

        // Sort descending by creation date
        filtered.sort(Comparator.comparing(
                UnifiedJobDTO::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        List<UnifiedJobDTO> pageContent = (start <= end && start < filtered.size())
                ? filtered.subList(start, end)
                : List.of();

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    /**
     * Get a single unified job by ID.
     */
    public UnifiedJobDTO getJobById(UUID id) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + id));
        return convertToUnifiedJobDTO(job);
    }

    /**
     * Get AI recommendations for a candidate.
     */
    public List<UnifiedJobDTO> getRecommendations(UUID supabaseUserId, int limit) {
        List<Job> activeJobs = jobRepository.findAll().stream()
                .filter(j -> !Boolean.TRUE.equals(j.getIsDeleted()) && j.getStatus() == JobStatus.ACTIVE)
                .sorted(Comparator.comparing(Job::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .collect(Collectors.toList());

        return activeJobs.stream()
                .map(this::convertToUnifiedJobDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get marketplace aggregation metrics.
     */
    public MarketplaceStatsDTO getStats() {
        List<Job> allActive = jobRepository.findAll().stream()
                .filter(j -> !Boolean.TRUE.equals(j.getIsDeleted()) && j.getStatus() == JobStatus.ACTIVE)
                .collect(Collectors.toList());

        long internalCount = allActive.stream()
                .filter(j -> j.getSourceType() == SourceType.HIREHUB || j.getSourceType() == SourceType.INTERNAL || j.getSourceType() == null)
                .count();

        long externalCount = allActive.size() - internalCount;

        Map<String, Long> jobsBySource = new HashMap<>();
        jobsBySource.put("HIREHUB", internalCount);
        jobsBySource.put("ADZUNA", allActive.stream().filter(j -> j.getSourceType() == SourceType.ADZUNA).count());
        jobsBySource.put("GREENHOUSE", allActive.stream().filter(j -> j.getSourceType() == SourceType.GREENHOUSE).count());
        jobsBySource.put("LEVER", allActive.stream().filter(j -> j.getSourceType() == SourceType.LEVER).count());

        JobSyncRun lastRun = syncRunRepository.findAllByOrderByStartedAtDesc(Pageable.ofSize(1))
                .getContent().stream().findFirst().orElse(null);

        int activeSources = jobSourceRepository.findByIsActiveAndIsDeletedFalse(true).size();

        return MarketplaceStatsDTO.builder()
                .totalJobs(allActive.size())
                .internalJobs(internalCount)
                .externalJobs(externalCount)
                .jobsBySource(jobsBySource)
                .lastSyncAt(lastRun != null ? lastRun.getStartedAt() : null)
                .lastSyncStatus(lastRun != null ? lastRun.getStatus().name() : "NEVER")
                .lastSyncJobsFetched(lastRun != null ? lastRun.getJobsFound() : 0)
                .activeSourceCount(activeSources > 0 ? activeSources : 3)
                .build();
    }

    private UnifiedJobDTO convertToUnifiedJobDTO(Job job) {
        int applicantCount = job.getId() != null ? jobApplicationRepository.countByJobIdAndIsDeletedFalse(job.getId()) : 0;

        List<String> skills = job.getSkills() != null
                ? job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName())
                .collect(Collectors.toList())
                : new ArrayList<>();

        String recruiterName = job.getRecruiter() != null && job.getRecruiter().getUser() != null
                ? job.getRecruiter().getUser().getFirstName() + " " + job.getRecruiter().getUser().getLastName()
                : null;

        SourceType effectiveSource = job.getSourceType() != null ? job.getSourceType() : SourceType.HIREHUB;

        return UnifiedJobDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .requirements(job.getRequirements())
                .companyName(job.getEffectiveCompanyName())
                .companyId(job.getCompany() != null ? job.getCompany().getId() : null)
                .recruiterId(job.getRecruiter() != null ? job.getRecruiter().getId() : null)
                .recruiterName(recruiterName)
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .workMode(job.getWorkMode() != null ? job.getWorkMode().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .minExperienceYears(job.getMinExperienceYears())
                .maxExperienceYears(job.getMaxExperienceYears())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .currency(job.getCurrency())
                .location(job.getLocation())
                .status(job.getStatus() != null ? job.getStatus().name() : null)
                .deadline(job.getDeadline() != null ? job.getDeadline().atStartOfDay() : null)
                .skills(skills)
                .sourceType(effectiveSource)
                .applicationUrl(job.getExternalUrl())
                .sourceLogoUrl(getSourceLogoUrl(effectiveSource))
                .applicantCount(applicantCount)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    private String getSourceLogoUrl(SourceType sourceType) {
        if (sourceType == null) return "/assets/sources/hirehub.svg";
        return switch (sourceType) {
            case ADZUNA -> "/assets/sources/adzuna.svg";
            case GREENHOUSE -> "/assets/sources/greenhouse.svg";
            case LEVER -> "/assets/sources/lever.svg";
            default -> "/assets/sources/hirehub.svg";
        };
    }
}

package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.enums.WorkMode;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Job extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = true)
    private RecruiterProfile recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = true)
    private Company company;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false)
    private WorkMode workMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column(name = "min_experience_years")
    private Integer minExperienceYears;

    @Column(name = "max_experience_years")
    private Integer maxExperienceYears;

    @Column(name = "min_salary", precision = 12, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "max_salary", precision = 12, scale = 2)
    private BigDecimal maxSalary;

    @Column(length = 10)
    private String currency = "USD";

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    private LocalDate deadline;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobSkill> skills = new ArrayList<>();

    @Column(name = "embedding_json", columnDefinition = "TEXT")
    private String embeddingJson;

    @Column(name = "screening_questions_json", columnDefinition = "TEXT")
    private String screeningQuestionsJson;

    // --- Aggregation & Multi-Source Marketplace Fields ---

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50)
    private SourceType sourceType = SourceType.HIREHUB;

    @Column(name = "external_job_id", length = 255)
    private String externalJobId;

    @Column(name = "external_url", length = 1000)
    private String externalUrl;

    @Column(name = "source_posted_at")
    private LocalDateTime sourcePostedAt;

    @Column(name = "source_updated_at")
    private LocalDateTime sourceUpdatedAt;

    @Column(name = "imported_at")
    private LocalDateTime importedAt;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "dedup_hash", length = 64)
    private String dedupHash;

    /**
     * Resolves the company name whether from linked Company entity or external source.
     */
    public String getEffectiveCompanyName() {
        if (company != null && company.getName() != null) {
            return company.getName();
        }
        return companyName != null ? companyName : "Company";
    }

    /**
     * Checks whether this is an aggregated external job.
     */
    public boolean isExternal() {
        return sourceType != null && sourceType != SourceType.HIREHUB && sourceType != SourceType.INTERNAL;
    }
}

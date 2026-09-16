package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> filterJobs(
            String keyword,
            String location,
            WorkMode workMode,
            EmploymentType employmentType,
            ExperienceLevel experienceLevel,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            JobStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always ignore soft deleted
            predicates.add(cb.isFalse(root.get("isDeleted")));

            // Status filter (default to ACTIVE if not specified)
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));
            }

            // Keyword in title, description, or company name
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate companyMatch = cb.like(cb.lower(root.join("company").get("name")), pattern);
                predicates.add(cb.or(titleMatch, descMatch, companyMatch));
            }

            // Location filter
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }

            // Work mode filter
            if (workMode != null) {
                predicates.add(cb.equal(root.get("workMode"), workMode));
            }

            // Employment type filter
            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            // Experience level filter
            if (experienceLevel != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
            }

            // Min salary filter (job maxSalary >= minSalary or job minSalary >= minSalary)
            if (minSalary != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("minSalary"), minSalary));
            }

            // Max salary filter
            if (maxSalary != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("maxSalary"), maxSalary));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

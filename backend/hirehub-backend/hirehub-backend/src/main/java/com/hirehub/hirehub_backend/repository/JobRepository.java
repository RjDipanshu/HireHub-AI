package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.SourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    Optional<Job> findByIdAndIsDeletedFalse(UUID id);

    List<Job> findByRecruiterIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID recruiterId);

    List<Job> findByCompanyIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID companyId);

    List<Job> findByCompanyIdAndStatusAndIsDeletedFalse(UUID companyId, JobStatus status);

    Page<Job> findByStatusAndIsDeletedFalse(JobStatus status, Pageable pageable);

    long countByCompanyIdAndStatusAndIsDeletedFalse(UUID companyId, JobStatus status);

    // --- Aggregation & Multi-Source Marketplace Queries ---

    Optional<Job> findBySourceTypeAndExternalJobIdAndIsDeletedFalse(SourceType sourceType, String externalJobId);

    Optional<Job> findByDedupHashAndIsDeletedFalse(String dedupHash);

    long countBySourceTypeAndIsDeletedFalse(SourceType sourceType);

    Page<Job> findBySourceTypeAndIsDeletedFalse(SourceType sourceType, Pageable pageable);

    Page<Job> findByIsDeletedFalse(Pageable pageable);

    long countByIsDeletedFalse();
}

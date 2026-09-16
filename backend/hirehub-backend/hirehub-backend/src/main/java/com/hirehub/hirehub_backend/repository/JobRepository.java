package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.enums.JobStatus;
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
}

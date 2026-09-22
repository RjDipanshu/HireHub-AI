package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.JobApplication;
import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    Optional<JobApplication> findByIdAndIsDeletedFalse(UUID id);

    List<JobApplication> findByCandidateIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID candidateId);

    List<JobApplication> findByJobIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID jobId);

    List<JobApplication> findByJobIdAndStatusAndIsDeletedFalse(UUID jobId, ApplicationStatus status);

    List<JobApplication> findByJobRecruiterIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID recruiterId);

    List<JobApplication> findByJobCompanyIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID companyId);

    boolean existsByJobIdAndCandidateIdAndIsDeletedFalse(UUID jobId, UUID candidateId);

    Optional<JobApplication> findByJobIdAndCandidateIdAndIsDeletedFalse(UUID jobId, UUID candidateId);

    int countByJobIdAndIsDeletedFalse(UUID jobId);
}

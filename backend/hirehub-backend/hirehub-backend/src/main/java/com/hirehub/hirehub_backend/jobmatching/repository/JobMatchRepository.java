package com.hirehub.hirehub_backend.jobmatching.repository;

import com.hirehub.hirehub_backend.jobmatching.entity.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, UUID> {

    Optional<JobMatch> findByCandidateIdAndJobIdAndIsDeletedFalse(UUID candidateId, UUID jobId);
}

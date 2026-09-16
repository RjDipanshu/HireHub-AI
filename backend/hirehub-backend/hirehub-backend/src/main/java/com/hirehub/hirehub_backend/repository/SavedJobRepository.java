package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {

    List<SavedJob> findByCandidateIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID candidateId);

    Optional<SavedJob> findByCandidateIdAndJobIdAndIsDeletedFalse(UUID candidateId, UUID jobId);

    boolean existsByCandidateIdAndJobIdAndIsDeletedFalse(UUID candidateId, UUID jobId);

    long countByJobIdAndIsDeletedFalse(UUID jobId);
}

package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByCandidateProfileIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID candidateProfileId);
    Optional<Resume> findByIdAndIsDeletedFalse(UUID id);
    Optional<Resume> findByCandidateProfileIdAndIsPrimaryTrueAndIsDeletedFalse(UUID candidateProfileId);
}

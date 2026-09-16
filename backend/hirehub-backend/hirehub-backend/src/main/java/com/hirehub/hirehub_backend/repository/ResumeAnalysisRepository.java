package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, UUID> {

    Optional<ResumeAnalysis> findTopByResumeIdOrderByCreatedAtDesc(UUID resumeId);

    List<ResumeAnalysis> findByCandidateProfileIdOrderByCreatedAtDesc(UUID candidateProfileId);

    Optional<ResumeAnalysis> findTopByCandidateProfileIdOrderByCreatedAtDesc(UUID candidateProfileId);
}

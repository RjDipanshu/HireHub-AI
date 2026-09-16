package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.CandidateSkillBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSkillBadgeRepository extends JpaRepository<CandidateSkillBadge, UUID> {
    List<CandidateSkillBadge> findByCandidateProfileIdAndIsDeletedFalseOrderByIssuedAtDesc(UUID candidateProfileId);
    Optional<CandidateSkillBadge> findByCandidateProfileIdAndSkillNameIgnoreCaseAndIsDeletedFalse(UUID candidateProfileId, String skillName);
}

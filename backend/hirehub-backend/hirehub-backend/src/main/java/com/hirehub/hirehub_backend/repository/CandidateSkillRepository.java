package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, UUID> {
    List<CandidateSkill> findByCandidateProfileIdAndIsDeletedFalse(UUID candidateProfileId);
    Optional<CandidateSkill> findByIdAndIsDeletedFalse(UUID id);
    Optional<CandidateSkill> findByCandidateProfileIdAndSkillIdAndIsDeletedFalse(UUID candidateProfileId, UUID skillId);
}

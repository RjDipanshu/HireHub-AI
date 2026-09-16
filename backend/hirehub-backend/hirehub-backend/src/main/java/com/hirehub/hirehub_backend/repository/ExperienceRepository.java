package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, UUID> {
    List<Experience> findByCandidateProfileIdAndIsDeletedFalseOrderByStartDateDesc(UUID candidateProfileId);
    Optional<Experience> findByIdAndIsDeletedFalse(UUID id);
}

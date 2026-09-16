package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EducationRepository extends JpaRepository<Education, UUID> {
    List<Education> findByCandidateProfileIdAndIsDeletedFalseOrderByStartDateDesc(UUID candidateProfileId);
    Optional<Education> findByIdAndIsDeletedFalse(UUID id);
}

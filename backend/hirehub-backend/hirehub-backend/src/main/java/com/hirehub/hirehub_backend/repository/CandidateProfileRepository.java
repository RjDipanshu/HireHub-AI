package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {
    
    Optional<CandidateProfile> findByIdAndIsDeletedFalse(UUID id);

    Optional<CandidateProfile> findByUserIdAndIsDeletedFalse(UUID userId);

    List<CandidateProfile> findByIsDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT cp FROM CandidateProfile cp WHERE cp.user.supabaseUserId = :supabaseUserId AND cp.isDeleted = false")
    Optional<CandidateProfile> findByUserSupabaseUserIdAndIsDeletedFalse(@Param("supabaseUserId") UUID supabaseUserId);

    boolean existsByUserIdAndIsDeletedFalse(UUID userId);
}

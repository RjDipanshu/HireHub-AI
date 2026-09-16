package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, UUID> {

    Optional<RecruiterProfile> findByIdAndIsDeletedFalse(UUID id);

    Optional<RecruiterProfile> findByUserIdAndIsDeletedFalse(UUID userId);

    @Query("SELECT rp FROM RecruiterProfile rp WHERE rp.user.supabaseUserId = :supabaseUserId AND rp.isDeleted = false")
    Optional<RecruiterProfile> findByUserSupabaseUserIdAndIsDeletedFalse(@Param("supabaseUserId") UUID supabaseUserId);

    List<RecruiterProfile> findByCompanyIdAndIsDeletedFalse(UUID companyId);

    boolean existsByUserIdAndIsDeletedFalse(UUID userId);
}

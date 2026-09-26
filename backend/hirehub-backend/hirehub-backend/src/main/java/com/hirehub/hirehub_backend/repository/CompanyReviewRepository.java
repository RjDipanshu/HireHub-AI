package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.CompanyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, UUID> {

    Page<CompanyReview> findByCompanyIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    List<CompanyReview> findByCompanyIdAndIsDeletedFalse(UUID companyId);

    @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.company.id = :companyId AND r.isDeleted = false")
    Double getAverageRatingByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT COUNT(r) FROM CompanyReview r WHERE r.company.id = :companyId AND r.isDeleted = false")
    Long countByCompanyId(@Param("companyId") UUID companyId);
}

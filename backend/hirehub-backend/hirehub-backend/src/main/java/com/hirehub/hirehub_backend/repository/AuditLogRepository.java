package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.isDeleted = false " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:search IS NULL OR LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(a.entityId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:startDate IS NULL OR a.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> searchAuditLogs(
            @Param("action") String action,
            @Param("entityType") String entityType,
            @Param("status") String status,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}

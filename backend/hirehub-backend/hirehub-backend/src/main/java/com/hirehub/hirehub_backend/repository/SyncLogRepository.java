package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.SyncLog;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.enums.SyncStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, UUID> {

    Page<SyncLog> findByIsDeletedFalseOrderBySyncStartedAtDesc(Pageable pageable);

    List<SyncLog> findBySourceTypeAndIsDeletedFalseOrderBySyncStartedAtDesc(SourceType sourceType);

    Optional<SyncLog> findFirstBySourceTypeAndStatusOrderBySyncStartedAtDesc(SourceType sourceType, SyncStatus status);

    Optional<SyncLog> findFirstByIsDeletedFalseOrderBySyncStartedAtDesc();
}

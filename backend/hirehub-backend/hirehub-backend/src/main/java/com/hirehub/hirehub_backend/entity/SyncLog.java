package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.enums.SyncStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Audit trail for every job aggregation sync operation.
 * Records jobs fetched, new, updated, duplicates, and errors per run.
 */
@Entity
@Table(name = "sync_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SyncLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private SourceType sourceType;

    @Column(name = "sync_started_at", nullable = false)
    private LocalDateTime syncStartedAt = LocalDateTime.now();

    @Column(name = "sync_completed_at")
    private LocalDateTime syncCompletedAt;

    @Column(name = "jobs_fetched")
    private Integer jobsFetched = 0;

    @Column(name = "jobs_new")
    private Integer jobsNew = 0;

    @Column(name = "jobs_updated")
    private Integer jobsUpdated = 0;

    @Column(name = "jobs_duplicate")
    private Integer jobsDuplicate = 0;

    @Column(name = "jobs_expired")
    private Integer jobsExpired = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SyncStatus status = SyncStatus.RUNNING;
}

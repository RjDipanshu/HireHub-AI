package com.hirehub.hirehub_backend.jobaggregation.entity;

import com.hirehub.hirehub_backend.entity.BaseEntity;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.enums.SyncStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Audit log recording the execution and metrics of a job aggregation sync run.
 */
@Entity
@Table(name = "job_sync_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSyncRun extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 50)
    private SourceType sourceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SyncStatus status;

    @Column(name = "jobs_found")
    private int jobsFound;

    @Column(name = "jobs_imported")
    private int jobsImported;

    @Column(name = "jobs_updated")
    private int jobsUpdated;

    @Column(name = "jobs_skipped")
    private int jobsSkipped;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private long durationMs;
}

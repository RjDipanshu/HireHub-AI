package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.SourceType;
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
 * Registry of configured external job API sources.
 * Tracks connection health, sync history, and enable/disable state.
 */
@Entity
@Table(name = "job_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobSource extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private SourceType sourceType;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "total_jobs_synced")
    private Long totalJobsSynced = 0L;

    @Column(name = "health_status", length = 30)
    private String healthStatus = "HEALTHY";
}

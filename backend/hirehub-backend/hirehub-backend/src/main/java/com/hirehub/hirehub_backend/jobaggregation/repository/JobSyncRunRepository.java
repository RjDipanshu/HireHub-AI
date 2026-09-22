package com.hirehub.hirehub_backend.jobaggregation.repository;

import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.entity.JobSyncRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobSyncRunRepository extends JpaRepository<JobSyncRun, UUID> {

    List<JobSyncRun> findBySourceTypeOrderByStartedAtDesc(SourceType sourceType);

    Page<JobSyncRun> findAllByOrderByStartedAtDesc(Pageable pageable);

    Optional<JobSyncRun> findTopByOrderByStartedAtDesc();

    Optional<JobSyncRun> findFirstBySourceTypeOrderByStartedAtDesc(SourceType sourceType);
}

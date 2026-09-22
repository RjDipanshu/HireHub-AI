package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.JobSource;
import com.hirehub.hirehub_backend.enums.SourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobSourceRepository extends JpaRepository<JobSource, UUID> {

    List<JobSource> findByIsActiveAndIsDeletedFalse(Boolean isActive);

    Optional<JobSource> findBySourceTypeAndIsDeletedFalse(SourceType sourceType);

    List<JobSource> findByIsDeletedFalse();
}

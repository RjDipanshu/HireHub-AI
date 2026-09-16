package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, UUID> {

    List<JobSkill> findByJobIdAndIsDeletedFalse(UUID jobId);

    void deleteByJobId(UUID jobId);
}

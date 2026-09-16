package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {
    Optional<Skill> findByNameIgnoreCaseAndIsDeletedFalse(String name);
    boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);
    List<Skill> findAllByIsDeletedFalseOrderByNameAsc();
    List<Skill> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword);
    List<Skill> findByCategoryIgnoreCaseAndIsDeletedFalse(String category);
}

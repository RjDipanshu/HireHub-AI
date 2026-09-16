package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByIdAndIsDeletedFalse(UUID id);

    Optional<Company> findByNameIgnoreCaseAndIsDeletedFalse(String name);

    boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

    List<Company> findAllByIsDeletedFalseOrderByNameAsc();

    List<Company> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword);

    List<Company> findByIndustryIgnoreCaseAndIsDeletedFalse(String industry);

    List<Company> findByIsVerifiedTrueAndIsDeletedFalseOrderByNameAsc();
}

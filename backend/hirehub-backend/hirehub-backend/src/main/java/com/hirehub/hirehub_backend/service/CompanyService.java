package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyResponseDTO;
import com.hirehub.hirehub_backend.entity.Company;
import com.hirehub.hirehub_backend.repository.CompanyRepository;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    public List<CompanyResponseDTO> getAllCompanies(String keyword) {
        List<Company> companies;
        if (keyword != null && !keyword.isBlank()) {
            companies = companyRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(keyword.trim());
        } else {
            companies = companyRepository.findAllByIsDeletedFalseOrderByNameAsc();
        }
        return companies.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CompanyResponseDTO> getCompaniesByIndustry(String industry) {
        return companyRepository.findByIndustryIgnoreCaseAndIsDeletedFalse(industry)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CompanyResponseDTO> getVerifiedCompanies() {
        return companyRepository.findByIsVerifiedTrueAndIsDeletedFalseOrderByNameAsc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public CompanyResponseDTO getCompanyById(UUID id) {
        Company company = companyRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));
        return convertToDTO(company);
    }

    @Transactional
    public CompanyResponseDTO createCompany(CompanyRequestDTO dto) {
        if (companyRepository.existsByNameIgnoreCaseAndIsDeletedFalse(dto.getName())) {
            throw new RuntimeException("A company with name '" + dto.getName() + "' already exists");
        }

        Company company = new Company();
        company.setName(dto.getName().trim());
        company.setIndustry(dto.getIndustry());
        company.setWebsiteUrl(dto.getWebsiteUrl());
        company.setDescription(dto.getDescription());
        company.setLogoUrl(dto.getLogoUrl());
        company.setLocation(dto.getLocation());
        company.setCompanySize(dto.getCompanySize() != null ? dto.getCompanySize() : com.hirehub.hirehub_backend.enums.CompanySize.MEDIUM_51_200);
        company.setIsVerified(false);
        company.setIsDeleted(false);
        // Option D: Life Page fields
        company.setCoverBannerUrl(dto.getCoverBannerUrl());
        company.setCultureStatement(dto.getCultureStatement());
        company.setTechStackJson(dto.getTechStackJson());
        company.setBenefitsJson(dto.getBenefitsJson());
        company.setOfficeLocations(dto.getOfficeLocations());

        Company saved = companyRepository.save(company);
        return convertToDTO(saved);
    }

    @Transactional
    public CompanyResponseDTO updateCompany(UUID id, CompanyRequestDTO dto) {
        Company company = companyRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        // Uniqueness check when name changes
        if (!company.getName().equalsIgnoreCase(dto.getName()) &&
                companyRepository.existsByNameIgnoreCaseAndIsDeletedFalse(dto.getName())) {
            throw new RuntimeException("A company with name '" + dto.getName() + "' already exists");
        }

        if (dto.getName() != null) company.setName(dto.getName().trim());
        if (dto.getIndustry() != null) company.setIndustry(dto.getIndustry());
        if (dto.getWebsiteUrl() != null) company.setWebsiteUrl(dto.getWebsiteUrl());
        if (dto.getDescription() != null) company.setDescription(dto.getDescription());
        if (dto.getLogoUrl() != null) company.setLogoUrl(dto.getLogoUrl());
        if (dto.getLocation() != null) company.setLocation(dto.getLocation());
        if (dto.getCompanySize() != null) company.setCompanySize(dto.getCompanySize());
        // Option D: Life Page fields (allow clearing by sending empty string)
        if (dto.getCoverBannerUrl() != null) company.setCoverBannerUrl(dto.getCoverBannerUrl());
        if (dto.getCultureStatement() != null) company.setCultureStatement(dto.getCultureStatement());
        if (dto.getTechStackJson() != null) company.setTechStackJson(dto.getTechStackJson());
        if (dto.getBenefitsJson() != null) company.setBenefitsJson(dto.getBenefitsJson());
        if (dto.getOfficeLocations() != null) company.setOfficeLocations(dto.getOfficeLocations());

        companyRepository.save(company);
        return convertToDTO(company);
    }

    @Transactional
    public CompanyResponseDTO verifyCompany(UUID id) {
        Company company = companyRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));
        company.setIsVerified(true);
        companyRepository.save(company);
        return convertToDTO(company);
    }

    @Transactional
    public void deleteCompany(UUID id) {
        Company company = companyRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));
        company.setIsDeleted(true);
        companyRepository.save(company);
    }

    public Company getCompanyEntityById(UUID id) {
        return companyRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));
    }

    public CompanyResponseDTO convertToDTO(Company company) {
        int recruiterCount = recruiterProfileRepository.findByCompanyIdAndIsDeletedFalse(company.getId()).size();
        return new CompanyResponseDTO(
                company.getId(),
                company.getName(),
                company.getIndustry(),
                company.getWebsiteUrl(),
                company.getDescription(),
                company.getLogoUrl(),
                company.getLocation(),
                company.getCompanySize(),
                company.getIsVerified(),
                recruiterCount,
                company.getCreatedAt(),
                company.getUpdatedAt(),
                // Option D: Life Page fields
                company.getCoverBannerUrl(),
                company.getCultureStatement(),
                company.getTechStackJson(),
                company.getBenefitsJson(),
                company.getOfficeLocations()
        );
    }
}

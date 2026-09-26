package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.company.CompanyReviewDTO;
import com.hirehub.hirehub_backend.dto.company.CompanyReviewStatsDTO;
import com.hirehub.hirehub_backend.entity.Company;
import com.hirehub.hirehub_backend.entity.CompanyReview;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.CompanyRepository;
import com.hirehub.hirehub_backend.repository.CompanyReviewRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyReviewService {

    private final CompanyReviewRepository companyReviewRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<CompanyReviewDTO> getReviewsByCompanyId(UUID companyId, Pageable pageable) {
        return companyReviewRepository.findByCompanyIdAndIsDeletedFalseOrderByCreatedAtDesc(companyId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public CompanyReviewDTO addReview(UUID companyId, UUID supabaseUserId, CompanyReviewDTO dto) {
        Company company = companyRepository.findByIdAndIsDeletedFalse(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + companyId));

        User user = null;
        if (supabaseUserId != null) {
            user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId).orElse(null);
        }

        CompanyReview review = CompanyReview.builder()
                .company(company)
                .user(user)
                .reviewerName(dto.getReviewerName() != null ? dto.getReviewerName() : (user != null ? user.getFirstName() + " " + user.getLastName().charAt(0) + "." : "Anonymous Employee"))
                .jobTitle(dto.getJobTitle() != null ? dto.getJobTitle() : "Employee")
                .employmentStatus(dto.getEmploymentStatus() != null ? dto.getEmploymentStatus() : "CURRENT_EMPLOYEE")
                .rating(dto.getRating() != null ? dto.getRating() : 5.0)
                .workLifeBalance(dto.getWorkLifeBalance() != null ? dto.getWorkLifeBalance() : dto.getRating())
                .cultureValues(dto.getCultureValues() != null ? dto.getCultureValues() : dto.getRating())
                .careerGrowth(dto.getCareerGrowth() != null ? dto.getCareerGrowth() : dto.getRating())
                .compensationBenefits(dto.getCompensationBenefits() != null ? dto.getCompensationBenefits() : dto.getRating())
                .reviewTitle(dto.getReviewTitle())
                .pros(dto.getPros())
                .cons(dto.getCons())
                .adviceToManagement(dto.getAdviceToManagement())
                .isRecommended(dto.getIsRecommended() != null ? dto.getIsRecommended() : true)
                .isVerified(true)
                .helpfulCount(0)
                .build();

        CompanyReview saved = companyReviewRepository.save(review);

        if (supabaseUserId != null) {
            auditLogService.logEvent(
                    supabaseUserId,
                    "COMPANY_REVIEW_CREATED",
                    "COMPANY",
                    companyId.toString(),
                    "Review published for company: " + company.getName(),
                    null,
                    null,
                    "SUCCESS"
            );
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public CompanyReviewStatsDTO getCompanyReviewStats(UUID companyId) {
        List<CompanyReview> reviews = companyReviewRepository.findByCompanyIdAndIsDeletedFalse(companyId);
        if (reviews.isEmpty()) {
            return CompanyReviewStatsDTO.builder()
                    .averageRating(0.0)
                    .totalReviews(0L)
                    .avgWorkLifeBalance(0.0)
                    .avgCultureValues(0.0)
                    .avgCareerGrowth(0.0)
                    .avgCompensationBenefits(0.0)
                    .recommendPercent(0.0)
                    .ratingDistribution(Map.of(1, 0L, 2, 0L, 3, 0L, 4, 0L, 5, 0L))
                    .build();
        }

        double totalRating = 0;
        double totalWlb = 0;
        double totalCulture = 0;
        double totalGrowth = 0;
        double totalComp = 0;
        int recommendCount = 0;
        Map<Integer, Long> dist = new HashMap<>();
        for (int i = 1; i <= 5; i++) dist.put(i, 0L);

        for (CompanyReview r : reviews) {
            double rating = r.getRating() != null ? r.getRating() : 5.0;
            totalRating += rating;
            totalWlb += r.getWorkLifeBalance() != null ? r.getWorkLifeBalance() : rating;
            totalCulture += r.getCultureValues() != null ? r.getCultureValues() : rating;
            totalGrowth += r.getCareerGrowth() != null ? r.getCareerGrowth() : rating;
            totalComp += r.getCompensationBenefits() != null ? r.getCompensationBenefits() : rating;
            if (Boolean.TRUE.equals(r.getIsRecommended())) recommendCount++;

            int rounded = (int) Math.round(rating);
            if (rounded >= 1 && rounded <= 5) {
                dist.put(rounded, dist.get(rounded) + 1);
            }
        }

        int count = reviews.size();
        return CompanyReviewStatsDTO.builder()
                .averageRating(Math.round((totalRating / count) * 10.0) / 10.0)
                .totalReviews((long) count)
                .avgWorkLifeBalance(Math.round((totalWlb / count) * 10.0) / 10.0)
                .avgCultureValues(Math.round((totalCulture / count) * 10.0) / 10.0)
                .avgCareerGrowth(Math.round((totalGrowth / count) * 10.0) / 10.0)
                .avgCompensationBenefits(Math.round((totalComp / count) * 10.0) / 10.0)
                .recommendPercent((double) Math.round(((double) recommendCount / count) * 100.0))
                .ratingDistribution(dist)
                .build();
    }

    @Transactional
    public void markHelpful(UUID reviewId) {
        companyReviewRepository.findById(reviewId).ifPresent(r -> {
            r.setHelpfulCount((r.getHelpfulCount() != null ? r.getHelpfulCount() : 0) + 1);
            companyReviewRepository.save(r);
        });
    }

    public CompanyReviewDTO mapToDTO(CompanyReview r) {
        return CompanyReviewDTO.builder()
                .id(r.getId())
                .companyId(r.getCompany() != null ? r.getCompany().getId() : null)
                .reviewerName(r.getReviewerName())
                .jobTitle(r.getJobTitle())
                .employmentStatus(r.getEmploymentStatus())
                .rating(r.getRating())
                .workLifeBalance(r.getWorkLifeBalance())
                .cultureValues(r.getCultureValues())
                .careerGrowth(r.getCareerGrowth())
                .compensationBenefits(r.getCompensationBenefits())
                .reviewTitle(r.getReviewTitle())
                .pros(r.getPros())
                .cons(r.getCons())
                .adviceToManagement(r.getAdviceToManagement())
                .isRecommended(r.getIsRecommended())
                .isVerified(r.getIsVerified())
                .helpfulCount(r.getHelpfulCount())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

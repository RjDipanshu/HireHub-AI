package com.hirehub.hirehub_backend.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewStatsDTO {
    private Double averageRating;
    private Long totalReviews;
    private Double avgWorkLifeBalance;
    private Double avgCultureValues;
    private Double avgCareerGrowth;
    private Double avgCompensationBenefits;
    private Double recommendPercent;
    private Map<Integer, Long> ratingDistribution;
}

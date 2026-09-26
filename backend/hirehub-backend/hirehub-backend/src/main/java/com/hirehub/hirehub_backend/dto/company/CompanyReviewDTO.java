package com.hirehub.hirehub_backend.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewDTO {
    private UUID id;
    private UUID companyId;
    private String reviewerName;
    private String jobTitle;
    private String employmentStatus;
    private Double rating;
    private Double workLifeBalance;
    private Double cultureValues;
    private Double careerGrowth;
    private Double compensationBenefits;
    private String reviewTitle;
    private String pros;
    private String cons;
    private String adviceToManagement;
    private Boolean isRecommended;
    private Boolean isVerified;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}

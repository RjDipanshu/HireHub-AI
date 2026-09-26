package com.hirehub.hirehub_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "reviewer_name", length = 150)
    private String reviewerName;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "employment_status", length = 50)
    @Builder.Default
    private String employmentStatus = "CURRENT_EMPLOYEE";

    @Column(nullable = false)
    private Double rating;

    @Column(name = "work_life_balance")
    private Double workLifeBalance;

    @Column(name = "culture_values")
    private Double cultureValues;

    @Column(name = "career_growth")
    private Double careerGrowth;

    @Column(name = "compensation_benefits")
    private Double compensationBenefits;

    @Column(name = "review_title", nullable = false, length = 200)
    private String reviewTitle;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String pros;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String cons;

    @Column(name = "advice_to_management", columnDefinition = "TEXT")
    private String adviceToManagement;

    @Column(name = "is_recommended")
    @Builder.Default
    private Boolean isRecommended = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = true;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;
}

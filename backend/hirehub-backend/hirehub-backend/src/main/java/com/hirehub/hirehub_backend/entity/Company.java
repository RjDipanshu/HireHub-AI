package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.CompanySize;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Company extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String industry;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size")
    private CompanySize companySize = CompanySize.MEDIUM_51_200;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "cover_banner_url")
    private String coverBannerUrl;

    @Column(name = "culture_statement", columnDefinition = "TEXT")
    private String cultureStatement;

    @Column(name = "tech_stack_json", columnDefinition = "TEXT")
    private String techStackJson;

    @Column(name = "benefits_json", columnDefinition = "TEXT")
    private String benefitsJson;

    @Column(name = "office_locations", length = 255)
    private String officeLocations;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RecruiterProfile> recruiters = new ArrayList<>();
}

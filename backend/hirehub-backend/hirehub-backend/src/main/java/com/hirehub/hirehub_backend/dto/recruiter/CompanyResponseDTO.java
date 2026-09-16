package com.hirehub.hirehub_backend.dto.recruiter;

import com.hirehub.hirehub_backend.enums.CompanySize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponseDTO {

    private UUID id;
    private String name;
    private String industry;
    private String websiteUrl;
    private String description;
    private String logoUrl;
    private String location;
    private CompanySize companySize;
    private Boolean isVerified;
    private Integer recruiterCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Option D: Company Life Page Fields ---
    private String coverBannerUrl;
    private String cultureStatement;
    private String techStackJson;
    private String benefitsJson;
    private String officeLocations;
}


package com.hirehub.hirehub_backend.dto.recruiter;

import com.hirehub.hirehub_backend.enums.CompanySize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequestDTO {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
    private String name;

    private String industry;

    private String websiteUrl;

    private String description;

    private String logoUrl;

    private String location;

    private CompanySize companySize = CompanySize.MEDIUM_51_200;

    // --- Option D: Company Life Page Fields ---
    private String coverBannerUrl;
    private String cultureStatement;
    /** JSON array string: ["React", "Spring Boot", "Kafka", ...] */
    private String techStackJson;
    /** JSON array string: ["Health Insurance", "Remote Work", ...] */
    private String benefitsJson;
    private String officeLocations;
}

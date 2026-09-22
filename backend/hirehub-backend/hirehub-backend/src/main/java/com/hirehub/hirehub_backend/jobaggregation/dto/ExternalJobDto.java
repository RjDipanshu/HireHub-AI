package com.hirehub.hirehub_backend.jobaggregation.dto;

import com.hirehub.hirehub_backend.enums.SourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Standard data transfer object representing a job listing fetched from an external source.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalJobDto {

    private String externalId;
    private SourceType sourceType;
    private String title;
    private String companyName;
    private String location;
    private String description;
    private String externalUrl;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;

    private String employmentType; // e.g. "permanent", "contract", "full_time"
    private String workMode;       // e.g. "remote", "hybrid", "onsite"
    private String experienceLevel;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    private LocalDateTime postedAt;
    private LocalDateTime updatedAt;

    private String rawJson;
}

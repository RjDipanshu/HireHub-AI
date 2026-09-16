package com.hirehub.hirehub_backend.dto.candidate;

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
public class CandidateSkillBadgeDTO {
    private UUID id;
    private UUID candidateProfileId;
    private String skillName;
    private String badgeTitle;
    private Double score;
    private Boolean isPassed;
    private LocalDateTime issuedAt;
}

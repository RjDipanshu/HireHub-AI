package com.hirehub.hirehub_backend.dto.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobResponseDTO {

    private UUID id;
    private UUID candidateProfileId;
    private JobResponseDTO job;
    private LocalDateTime savedAt;
}

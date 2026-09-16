package com.hirehub.hirehub_backend.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeDTO {
    private UUID id;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private String fileType;

    private Long fileSize;

    private Boolean isPrimary = false;

    private Double atsScore;

    private LocalDateTime createdAt;
}

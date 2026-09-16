package com.hirehub.hirehub_backend.dto.application;

import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private String feedback;

    private String rejectionReason;
}

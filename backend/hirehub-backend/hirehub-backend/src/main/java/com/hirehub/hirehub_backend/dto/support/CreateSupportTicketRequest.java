package com.hirehub.hirehub_backend.dto.support;

import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating a new support ticket")
public class CreateSupportTicketRequest {

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 200, message = "Subject must be between 5 and 200 characters")
    @Schema(description = "Summary of the support issue", example = "Unable to upload PDF resume in profile")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    @Schema(description = "Detailed explanation of the issue encountered", example = "When attempting to upload my 2MB resume in PDF format, the system returns a timeout error.")
    private String description;

    @NotNull(message = "Category is required")
    @Schema(description = "Category of the issue", example = "TECHNICAL")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    @Schema(description = "Urgency priority level", example = "MEDIUM")
    private TicketPriority priority;
}

package com.hirehub.hirehub_backend.dto.support;

import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a support ticket")
public class SupportTicketResponse {

    @Schema(description = "Public human-readable ticket reference ID", example = "HH-2026-000001")
    private String ticketId;

    @Schema(description = "Subject summary of the ticket", example = "Unable to upload PDF resume in profile")
    private String subject;

    @Schema(description = "Full description of the support issue", example = "When attempting to upload my 2MB resume in PDF format...")
    private String description;

    @Schema(description = "Ticket category", example = "TECHNICAL")
    private TicketCategory category;

    @Schema(description = "Ticket priority", example = "MEDIUM")
    private TicketPriority priority;

    @Schema(description = "Current resolution status", example = "OPEN")
    private TicketStatus status;

    @Schema(description = "Timestamp when ticket was created")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when ticket was last updated")
    private LocalDateTime updatedAt;

    // Added for Admin dashboard context
    @Schema(description = "Full name of the user who submitted the ticket")
    private String userName;

    @Schema(description = "Email of the user who submitted the ticket")
    private String userEmail;
}

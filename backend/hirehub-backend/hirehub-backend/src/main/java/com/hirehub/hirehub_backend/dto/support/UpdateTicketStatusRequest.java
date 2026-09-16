package com.hirehub.hirehub_backend.dto.support;

import com.hirehub.hirehub_backend.enums.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for updating a ticket's status")
public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    @Schema(description = "New resolution status", example = "IN_PROGRESS")
    private TicketStatus status;
}

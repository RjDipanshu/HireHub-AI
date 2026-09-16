package com.hirehub.hirehub_backend.dto.support;

import com.hirehub.hirehub_backend.enums.TicketPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for updating a ticket's priority")
public class UpdateTicketPriorityRequest {

    @NotNull(message = "Priority is required")
    @Schema(description = "New priority level", example = "HIGH")
    private TicketPriority priority;
}

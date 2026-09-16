package com.hirehub.hirehub_backend.dto.communication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectMessageRequestDTO {
    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;

    private UUID jobId;

    private String subject;

    @NotBlank(message = "Message text cannot be empty")
    private String messageText;
}

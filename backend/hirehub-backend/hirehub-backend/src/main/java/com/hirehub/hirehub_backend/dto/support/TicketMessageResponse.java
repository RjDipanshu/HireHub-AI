package com.hirehub.hirehub_backend.dto.support;

import com.hirehub.hirehub_backend.enums.MessageSenderType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a single message in a support ticket thread")
public class TicketMessageResponse {

    @Schema(description = "Internal unique message ID")
    private UUID id;

    @Schema(description = "Message content", example = "Can you provide an update on this?")
    private String message;

    @Schema(description = "Display name of the sender", example = "Dipanshu Sharma")
    private String senderName;

    @Schema(description = "Email address of the sender", example = "candidate@hirehub.ai")
    private String senderEmail;

    @Schema(description = "Type of sender (USER, SUPPORT, SYSTEM)", example = "USER")
    private MessageSenderType senderType;

    @Schema(description = "Timestamp when message was created")
    private LocalDateTime createdAt;
}

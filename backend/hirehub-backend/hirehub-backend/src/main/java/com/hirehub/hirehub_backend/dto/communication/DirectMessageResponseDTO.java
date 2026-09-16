package com.hirehub.hirehub_backend.dto.communication;

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
public class DirectMessageResponseDTO {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private String senderEmail;
    private String senderProfileImage;
    private String senderRole;

    private UUID recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientProfileImage;

    private UUID jobId;
    private String jobTitle;

    private String subject;
    private String messageText;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}

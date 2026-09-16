package com.hirehub.hirehub_backend.dto.communication;

import com.hirehub.hirehub_backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private String linkUrl;
    private LocalDateTime createdAt;
}

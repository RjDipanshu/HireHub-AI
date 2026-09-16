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
public class DirectMessageThreadDTO {
    private UUID otherUserId;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserProfileImage;
    private String otherUserRole;
    private String lastMessageSubject;
    private String lastMessageText;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;
}

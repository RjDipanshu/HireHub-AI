package com.hirehub.hirehub_backend.dto.audit;

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
public class AuditLogResponseDTO {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String action;
    private String entityType;
    private String entityId;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String details;
    private LocalDateTime createdAt;
}

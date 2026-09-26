package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.audit.AuditLogResponseDTO;
import com.hirehub.hirehub_backend.entity.AuditLog;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.AuditLogRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public AuditLog logEvent(UUID supabaseUserId, String action, String entityType, String entityId, 
                             String details, String ipAddress, String userAgent, String status) {
        User user = null;
        String userEmail = null;

        if (supabaseUserId != null) {
            Optional<User> userOpt = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId);
            if (userOpt.isPresent()) {
                user = userOpt.get();
                userEmail = user.getEmail();
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .userEmail(userEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .status(status != null ? status : "SUCCESS")
                .build();

        try {
            return auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage(), e);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> getAuditLogs(
            String action,
            String entityType,
            String status,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        
        return auditLogRepository.searchAuditLogs(
                action,
                entityType,
                status,
                search,
                startDate,
                endDate,
                pageable
        ).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDTO> getAuditLogsForUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
    }

    public AuditLogResponseDTO mapToDTO(AuditLog log) {
        return AuditLogResponseDTO.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUserEmail())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .status(log.getStatus())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

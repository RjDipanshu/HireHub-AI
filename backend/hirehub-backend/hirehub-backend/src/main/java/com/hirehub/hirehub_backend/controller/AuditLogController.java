package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.audit.AuditLogResponseDTO;
import com.hirehub.hirehub_backend.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Audit Logs", description = "Enterprise Compliance & Security Audit Trail API")
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Operation(summary = "Query audit logs (Admin only)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLogResponseDTO>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(auditLogService.getAuditLogs(action, entityType, status, search, startDate, endDate, pageable));
    }

    @Operation(summary = "Record security or user action audit log")
    @PostMapping("/event")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuditLogResponseDTO> recordEvent(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        String action = payload.getOrDefault("action", "CLIENT_EVENT");
        String entityType = payload.getOrDefault("entityType", "USER");
        String entityId = payload.getOrDefault("entityId", supabaseUserId.toString());
        String details = payload.getOrDefault("details", "");
        String status = payload.getOrDefault("status", "SUCCESS");

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        var auditLog = auditLogService.logEvent(
                supabaseUserId, action, entityType, entityId, details, ipAddress, userAgent, status
        );

        return ResponseEntity.ok(auditLog != null ? auditLogService.mapToDTO(auditLog) : null);
    }
}

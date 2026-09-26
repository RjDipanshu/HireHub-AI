package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.gdpr.GdprExportDTO;
import com.hirehub.hirehub_backend.service.GdprService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "GDPR & Privacy", description = "GDPR Compliance, Data Portability, Account Erasure, and 2FA")
@RestController
@RequestMapping("/api/v1/privacy")
@RequiredArgsConstructor
public class GdprController {

    private final GdprService gdprService;

    @Operation(summary = "Export personal data archive (GDPR Art. 20)")
    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GdprExportDTO> exportMyData(
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        GdprExportDTO exportDTO = gdprService.exportUserData(supabaseUserId, ipAddress, userAgent);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"hirehub_gdpr_data_export.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(exportDTO);
    }

    @Operation(summary = "Request account erasure (GDPR Art. 17 - Right to be forgotten)")
    @PostMapping("/delete-account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteMyAccount(
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        String reason = payload != null ? payload.get("reason") : "User initiated";
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        Map<String, String> response = gdprService.deleteUserAccount(supabaseUserId, reason, ipAddress, userAgent);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Sync 2FA status to backend")
    @PostMapping("/2fa/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateTwoFactorStatus(
            @RequestBody Map<String, Boolean> payload,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        boolean enabled = Boolean.TRUE.equals(payload.get("enabled"));
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        gdprService.updateTwoFactorStatus(supabaseUserId, enabled, ipAddress, userAgent);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "twoFactorEnabled", enabled));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

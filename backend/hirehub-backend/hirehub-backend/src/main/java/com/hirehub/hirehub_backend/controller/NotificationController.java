package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.communication.NotificationResponseDTO;
import com.hirehub.hirehub_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Notifications", description = "User notification alerts, unread counts, and broadcast messaging")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get user notifications", description = "Retrieves all notifications for current authenticated user ordered by date descending")
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(notificationService.getUserNotifications(supabaseUserId));
    }

    @Operation(summary = "Get unread notification count", description = "Returns the integer count of unread notifications for badge counters")
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        long count = notificationService.getUnreadCount(supabaseUserId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @Operation(summary = "Mark notification as read", description = "Marks an individual notification as read by UUID")
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        notificationService.markAsRead(id, supabaseUserId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Mark all notifications as read", description = "Acknowledges all notifications for the authenticated user")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        notificationService.markAllAsRead(supabaseUserId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Broadcast announcement", description = "Platform-wide or role-targeted alert dispatch (Admin only)")
    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastNotification(
            @RequestBody Map<String, String> payload) {
        String title = payload.getOrDefault("title", "Platform Announcement");
        String message = payload.getOrDefault("message", "");
        String targetRole = payload.getOrDefault("targetRole", "ALL");
        String linkUrl = payload.get("linkUrl");

        int sentCount = notificationService.broadcastNotification(
                title, message, com.hirehub.hirehub_backend.enums.NotificationType.SYSTEM, targetRole, linkUrl
        );

        return ResponseEntity.ok(Map.of("message", "Broadcast delivered", "recipientsCount", sentCount));
    }
}

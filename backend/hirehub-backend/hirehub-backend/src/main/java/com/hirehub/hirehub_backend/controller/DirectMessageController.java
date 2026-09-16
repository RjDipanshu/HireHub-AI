package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.communication.DirectMessageRequestDTO;
import com.hirehub.hirehub_backend.dto.communication.DirectMessageResponseDTO;
import com.hirehub.hirehub_backend.dto.communication.DirectMessageThreadDTO;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.UserRepository;
import com.hirehub.hirehub_backend.service.DirectMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class DirectMessageController {

    private final DirectMessageService directMessageService;
    private final UserRepository userRepository;

    private User resolveCurrentUser(Jwt jwt) {
        if (jwt != null) {
            try {
                UUID supabaseUserId = UUID.fromString(jwt.getSubject());
                return userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId).orElse(null);
            } catch (Exception ignored) {}
        }
        // Dev fallback to first active user
        List<User> users = userRepository.findAllByIsDeletedFalse();
        return users.isEmpty() ? null : users.get(0);
    }

    @PostMapping
    public ResponseEntity<DirectMessageResponseDTO> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody DirectMessageRequestDTO request) {
        User sender = resolveCurrentUser(jwt);
        if (sender == null) {
            throw new RuntimeException("Current user not authenticated");
        }
        return ResponseEntity.ok(directMessageService.sendMessage(sender.getId(), request));
    }

    @GetMapping("/threads")
    public ResponseEntity<List<DirectMessageThreadDTO>> getThreads(@AuthenticationPrincipal Jwt jwt) {
        User user = resolveCurrentUser(jwt);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(directMessageService.getUserThreads(user.getId()));
    }

    @GetMapping("/thread/{otherUserId}")
    public ResponseEntity<List<DirectMessageResponseDTO>> getConversation(
            @PathVariable UUID otherUserId,
            @AuthenticationPrincipal Jwt jwt) {
        User user = resolveCurrentUser(jwt);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(directMessageService.getConversation(user.getId(), otherUserId));
    }

    @PatchMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID messageId,
            @AuthenticationPrincipal Jwt jwt) {
        User user = resolveCurrentUser(jwt);
        if (user != null) {
            directMessageService.markAsRead(messageId, user.getId());
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        User user = resolveCurrentUser(jwt);
        long count = user != null ? directMessageService.getUnreadCount(user.getId()) : 0L;
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}

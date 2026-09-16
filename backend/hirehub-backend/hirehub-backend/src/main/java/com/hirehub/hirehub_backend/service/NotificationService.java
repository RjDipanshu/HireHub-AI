package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.communication.NotificationResponseDTO;
import com.hirehub.hirehub_backend.entity.Notification;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.NotificationType;
import com.hirehub.hirehub_backend.repository.NotificationRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type, String linkUrl) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type != null ? type : NotificationType.SYSTEM);
        notification.setIsRead(false);
        notification.setLinkUrl(linkUrl);
        notification.setIsDeleted(false);
        return notificationRepository.save(notification);
    }

    public List<NotificationResponseDTO> getUserNotifications(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalseAndIsDeletedFalse(user.getId());
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID supabaseUserId) {
        Notification notification = notificationRepository.findByIdAndIsDeletedFalse(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public int broadcastNotification(String title, String message, NotificationType type, String targetRole, String linkUrl) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .filter(u -> targetRole == null || "ALL".equalsIgnoreCase(targetRole) ||
                        (u.getRole() != null && u.getRole().getName().name().equalsIgnoreCase(targetRole)))
                .collect(Collectors.toList());

        List<Notification> notifications = users.stream().map(u -> {
            Notification n = new Notification();
            n.setUser(u);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type != null ? type : NotificationType.SYSTEM);
            n.setIsRead(false);
            n.setLinkUrl(linkUrl);
            n.setIsDeleted(false);
            return n;
        }).collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
        return notifications.size();
    }

    public NotificationResponseDTO convertToDTO(Notification n) {
        return new NotificationResponseDTO(
                n.getId(),
                n.getUser().getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getIsRead(),
                n.getLinkUrl(),
                n.getCreatedAt()
        );
    }
}

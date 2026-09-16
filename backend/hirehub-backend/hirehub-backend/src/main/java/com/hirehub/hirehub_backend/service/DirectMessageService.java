package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.communication.DirectMessageRequestDTO;
import com.hirehub.hirehub_backend.dto.communication.DirectMessageResponseDTO;
import com.hirehub.hirehub_backend.dto.communication.DirectMessageThreadDTO;
import com.hirehub.hirehub_backend.entity.DirectMessage;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.Notification;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.NotificationType;
import com.hirehub.hirehub_backend.repository.DirectMessageRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.NotificationRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DirectMessageService {

    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public DirectMessageResponseDTO sendMessage(UUID senderUserId, DirectMessageRequestDTO request) {
        User sender = userRepository.findByIdAndIsDeletedFalse(senderUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderUserId));

        User recipient = userRepository.findByIdAndIsDeletedFalse(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found with ID: " + request.getRecipientId()));

        Job job = null;
        if (request.getJobId() != null) {
            job = jobRepository.findByIdAndIsDeletedFalse(request.getJobId()).orElse(null);
        }

        DirectMessage msg = new DirectMessage();
        msg.setSender(sender);
        msg.setRecipient(recipient);
        msg.setJob(job);
        msg.setSubject(request.getSubject() != null && !request.getSubject().isBlank() ? request.getSubject().trim() : "Direct Message");
        msg.setMessageText(request.getMessageText().trim());
        msg.setIsRead(false);
        msg.setIsDeleted(false);

        DirectMessage saved = directMessageRepository.save(msg);

        // Send notification to recipient
        try {
            Notification notif = new Notification();
            notif.setUser(recipient);
            String senderFullName = (sender.getFirstName() + " " + sender.getLastName()).trim();
            notif.setTitle("💬 New InMail from " + senderFullName);
            String snippet = saved.getMessageText().length() > 80
                    ? saved.getMessageText().substring(0, 80) + "..."
                    : saved.getMessageText();
            notif.setMessage(snippet);
            notif.setType(NotificationType.SYSTEM);
            boolean isRecipientRecruiter = recipient.getRole() != null && "RECRUITER".equalsIgnoreCase(recipient.getRole().getName().name());
            notif.setLinkUrl(isRecipientRecruiter ? "/recruiter/messages" : "/candidate/messages");
            notif.setIsDeleted(false);
            notificationRepository.save(notif);
        } catch (Exception ignored) {}

        return mapToDTO(saved);
    }

    @Transactional
    public List<DirectMessageResponseDTO> getConversation(UUID currentUserId, UUID otherUserId) {
        List<DirectMessage> messages = directMessageRepository.findConversationBetweenUsers(currentUserId, otherUserId);

        // Auto mark as read messages sent to current user
        boolean markedAny = false;
        for (DirectMessage m : messages) {
            if (m.getRecipient() != null && m.getRecipient().getId().equals(currentUserId) && !Boolean.TRUE.equals(m.getIsRead())) {
                m.setIsRead(true);
                m.setReadAt(LocalDateTime.now());
                markedAny = true;
            }
        }
        if (markedAny) {
            directMessageRepository.saveAll(messages);
        }

        return messages.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<DirectMessageThreadDTO> getUserThreads(UUID currentUserId) {
        List<DirectMessage> allMessages = directMessageRepository.findAllByUserOrderByCreatedAtDesc(currentUserId);

        Map<UUID, List<DirectMessage>> grouped = new LinkedHashMap<>();
        for (DirectMessage m : allMessages) {
            UUID otherUserId = m.getSender().getId().equals(currentUserId)
                    ? m.getRecipient().getId()
                    : m.getSender().getId();
            grouped.computeIfAbsent(otherUserId, k -> new ArrayList<>()).add(m);
        }

        List<DirectMessageThreadDTO> threads = new ArrayList<>();
        for (Map.Entry<UUID, List<DirectMessage>> entry : grouped.entrySet()) {
            UUID otherUserId = entry.getKey();
            List<DirectMessage> threadMessages = entry.getValue();
            DirectMessage latest = threadMessages.get(0);

            User otherUser = latest.getSender().getId().equals(currentUserId)
                    ? latest.getRecipient()
                    : latest.getSender();

            long unread = threadMessages.stream()
                    .filter(m -> m.getRecipient().getId().equals(currentUserId) && !Boolean.TRUE.equals(m.getIsRead()))
                    .count();

            String roleName = (otherUser.getRole() != null) ? otherUser.getRole().getName().name() : "USER";

            threads.add(DirectMessageThreadDTO.builder()
                    .otherUserId(otherUser.getId())
                    .otherUserName((otherUser.getFirstName() + " " + otherUser.getLastName()).trim())
                    .otherUserEmail(otherUser.getEmail())
                    .otherUserProfileImage(otherUser.getProfileImageUrl())
                    .otherUserRole(roleName)
                    .lastMessageSubject(latest.getSubject())
                    .lastMessageText(latest.getMessageText())
                    .lastMessageAt(latest.getCreatedAt())
                    .unreadCount(unread)
                    .build());
        }

        return threads;
    }

    @Transactional
    public void markAsRead(UUID messageId, UUID currentUserId) {
        DirectMessage msg = directMessageRepository.findById(messageId).orElse(null);
        if (msg != null && msg.getRecipient() != null && msg.getRecipient().getId().equals(currentUserId)) {
            msg.setIsRead(true);
            msg.setReadAt(LocalDateTime.now());
            directMessageRepository.save(msg);
        }
    }

    public long getUnreadCount(UUID currentUserId) {
        return directMessageRepository.countByRecipientIdAndIsReadFalseAndIsDeletedFalse(currentUserId);
    }

    private DirectMessageResponseDTO mapToDTO(DirectMessage m) {
        User sender = m.getSender();
        User recipient = m.getRecipient();
        Job job = m.getJob();

        return DirectMessageResponseDTO.builder()
                .id(m.getId())
                .senderId(sender != null ? sender.getId() : null)
                .senderName(sender != null ? (sender.getFirstName() + " " + sender.getLastName()).trim() : "")
                .senderEmail(sender != null ? sender.getEmail() : "")
                .senderProfileImage(sender != null ? sender.getProfileImageUrl() : null)
                .senderRole(sender != null && sender.getRole() != null ? sender.getRole().getName().name() : "")
                .recipientId(recipient != null ? recipient.getId() : null)
                .recipientName(recipient != null ? (recipient.getFirstName() + " " + recipient.getLastName()).trim() : "")
                .recipientEmail(recipient != null ? recipient.getEmail() : "")
                .recipientProfileImage(recipient != null ? recipient.getProfileImageUrl() : null)
                .jobId(job != null ? job.getId() : null)
                .jobTitle(job != null ? job.getTitle() : null)
                .subject(m.getSubject())
                .messageText(m.getMessageText())
                .isRead(m.getIsRead())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}

package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.support.CreateSupportTicketRequest;
import com.hirehub.hirehub_backend.dto.support.CreateTicketMessageRequest;
import com.hirehub.hirehub_backend.dto.support.SupportTicketResponse;
import com.hirehub.hirehub_backend.dto.support.TicketMessageResponse;
import com.hirehub.hirehub_backend.entity.SupportTicket;
import com.hirehub.hirehub_backend.entity.SupportTicketMessage;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.MessageSenderType;
import com.hirehub.hirehub_backend.enums.NotificationType;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
import com.hirehub.hirehub_backend.repository.SupportTicketMessageRepository;
import com.hirehub.hirehub_backend.repository.SupportTicketRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import com.hirehub.hirehub_backend.exception.TicketCreationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;
    private final SupportTicketMessageRepository supportTicketMessageRepository;
    private final NotificationService notificationService;

    // Sequence counter fallback cache to assist progression when DB sequence is offline or in unit tests
    private final AtomicLong fallbackSequenceCounter = new AtomicLong(0);

    public static final Pattern TICKET_ID_PATTERN = Pattern.compile("^HH-\\d{4}-\\d{6}$");

    /**
     * Creates a new support ticket for the authenticated user.
     * Enforces database-level uniqueness, sequence-backed ID generation, and concurrency safety.
     */
    @Transactional
    public SupportTicketResponse createTicket(CreateSupportTicketRequest request, UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated credentials"));

        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            String ticketId = generateUniqueTicketId();

            SupportTicket ticket = SupportTicket.builder()
                    .ticketId(ticketId)
                    .user(user)
                    .subject(request.getSubject().trim())
                    .description(request.getDescription().trim())
                    .category(request.getCategory())
                    .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
                    .status(TicketStatus.OPEN)
                    .build();

            ticket.setIsDeleted(false);

            try {
                SupportTicket savedTicket = supportTicketRepository.saveAndFlush(ticket);
                log.info("Successfully created support ticket: {} for user: {}", savedTicket.getTicketId(), user.getId());

                // Extensibility hook for future support email notification trigger (Parts 8/9)
                onTicketCreated(savedTicket);

                return mapToResponse(savedTicket);
            } catch (DataIntegrityViolationException ex) {
                log.warn("Database constraint collision on attempt {}/{} for ticketId {}: {}", attempt, maxRetries, ticketId, ex.getMessage());
                if (attempt == maxRetries) {
                    log.error("Failed to persist ticket after {} attempts due to unique constraint collision.", maxRetries);
                    throw new TicketCreationException("A unique ticket reference could not be generated. Please try again.");
                }
            }
        }

        throw new TicketCreationException("Failed to create support ticket after retries.");
    }

    /**
     * Retrieves all support tickets submitted by the authenticated user.
     */
    public List<SupportTicketResponse> getMyTickets(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated credentials"));

        return supportTicketRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single support ticket by its public ticketId, verifying ownership.
     * Prevents cross-user data leakage by scoping the query to the authenticated user.
     */
    public SupportTicketResponse getMyTicketByTicketId(String ticketId, UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated credentials"));

        SupportTicket ticket = supportTicketRepository.findByTicketIdAndUserIdAndIsDeletedFalse(ticketId, user.getId())
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));

        return mapToResponse(ticket);
    }

    /**
     * Server-side unique ticket ID generation in the format HH-YYYY-XXXXXX (e.g. HH-2026-000001).
     * Backed by PostgreSQL atomic sequence `support_ticket_seq` to ensure cluster-safe concurrency.
     */
    public String generateUniqueTicketId() {
        int currentYear = Year.now().getValue();
        long sequenceNumber = fetchNextSequenceValue();

        String formattedId = String.format("HH-%d-%06d", currentYear, sequenceNumber);

        if (!TICKET_ID_PATTERN.matcher(formattedId).matches()) {
            throw new IllegalStateException("Generated ticket ID does not conform to pattern HH-YYYY-XXXXXX: " + formattedId);
        }

        return formattedId;
    }

    /**
     * Fetches the next atomic sequence value from the database sequence,
     * or uses atomic in-memory fallback counter in non-PostgreSQL/mock environments.
     */
    public long fetchNextSequenceValue() {
        try {
            Long nextSeq = supportTicketRepository.getNextTicketSequenceValue();
            if (nextSeq != null && nextSeq > 0) {
                return nextSeq;
            }
        } catch (Exception ex) {
            log.debug("Database sequence query bypassed or unsupported: {}. Using atomic fallback sequence.", ex.getMessage());
        }
        return fallbackSequenceCounter.incrementAndGet();
    }

    /**
     * Lifecycle hook for email notifications after successful ticket creation (Parts 8 & 9).
     * Triggers:
     *   1. User confirmation email (Part 8)
     *   2. Support-team notification email (Part 9)
     * Each dispatch is independently try-caught so one failure does not affect the other,
     * and neither can roll back or fail the ticket persistence.
     */
    protected void onTicketCreated(SupportTicket ticket) {
        log.debug("Ticket lifecycle hook onTicketCreated invoked for ticket: {}", ticket.getTicketId());

        User user = ticket.getUser();
        String recipientEmail = user != null ? user.getEmail() : null;
        String recipientName = user != null ? user.getFirstName() : null;
        String userFullName = buildUserFullName(user);
        String categoryStr = ticket.getCategory() != null ? ticket.getCategory().name() : null;
        String priorityStr = ticket.getPriority() != null ? ticket.getPriority().name() : null;
        String statusStr = ticket.getStatus() != null ? ticket.getStatus().name() : null;

        // Part 8: User confirmation email
        try {
            if (recipientEmail != null && !recipientEmail.isBlank()) {
                emailNotificationService.sendSupportTicketConfirmation(
                        recipientEmail,
                        recipientName,
                        ticket.getTicketId(),
                        ticket.getSubject(),
                        categoryStr,
                        priorityStr,
                        statusStr,
                        ticket.getCreatedAt()
                );
            } else {
                log.warn("Cannot send ticket confirmation email: No recipient email found for user in ticket {}", ticket.getTicketId());
            }
        } catch (Exception ex) {
            log.error("Failed to send support ticket confirmation email for ticket {}: {}", ticket.getTicketId(), ex.getMessage());
        }

        // Part 9: Support-team notification email
        try {
            emailNotificationService.sendSupportTeamNotification(
                    ticket.getTicketId(),
                    ticket.getSubject(),
                    ticket.getDescription(),
                    categoryStr,
                    priorityStr,
                    statusStr,
                    ticket.getCreatedAt(),
                    userFullName,
                    recipientEmail
            );
        } catch (Exception ex) {
            log.error("Failed to send support team notification email for ticket {}: {}", ticket.getTicketId(), ex.getMessage());
        }
        
        // Part 12: In-app Notification for Admin
        try {
            String title = "New Support Ticket";
            String message = "Ticket " + ticket.getTicketId() + " - " + ticket.getSubject();
            notifyAdmins(title, message, "/admin/support");
        } catch (Exception ex) {
            log.error("Failed to generate in-app notification for new ticket {}: {}", ticket.getTicketId(), ex.getMessage());
        }
    }

    /**
     * Builds a display-friendly full name from the User entity.
     */
    private String buildUserFullName(User user) {
        if (user == null) return null;
        String first = user.getFirstName();
        String last = user.getLastName();
        if (first == null && last == null) return null;
        StringBuilder sb = new StringBuilder();
        if (first != null && !first.isBlank()) sb.append(first.trim());
        if (last != null && !last.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(last.trim());
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    public SupportTicketResponse mapToResponse(SupportTicket ticket) {
        SupportTicketResponse response = SupportTicketResponse.builder()
                .ticketId(ticket.getTicketId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
                
        if (ticket.getUser() != null) {
            response.setUserName(buildUserFullName(ticket.getUser()));
            response.setUserEmail(ticket.getUser().getEmail());
        }
        
        return response;
    }

    // ==========================================
    // Part 10: User Messages
    // ==========================================
    
    @Transactional
    public TicketMessageResponse addMessage(String ticketId, CreateTicketMessageRequest request, UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = supportTicketRepository.findByTicketIdAndUserIdAndIsDeletedFalse(ticketId, user.getId())
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new RuntimeException("Cannot reply to a closed or resolved ticket.");
        }

        SupportTicketMessage message = SupportTicketMessage.builder()
                .ticket(ticket)
                .sender(user)
                .message(request.getMessage().trim())
                .senderType(MessageSenderType.USER)
                .build();

        message.setIsDeleted(false);
        SupportTicketMessage savedMessage = supportTicketMessageRepository.save(message);

        // Re-open ticket if it was waiting for user
        if (ticket.getStatus() == TicketStatus.WAITING_FOR_USER) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            supportTicketRepository.save(ticket);
        }

        // Notify Admins
        try {
            String title = "New Reply on Ticket " + ticket.getTicketId();
            String snippet = message.getMessage();
            if (snippet.length() > 50) snippet = snippet.substring(0, 47) + "...";
            String msgText = (user.getFirstName() != null ? user.getFirstName() : "User") + " replied: " + snippet;
            notifyAdmins(title, msgText, "/admin/support");
        } catch (Exception ex) {
            log.error("Failed to notify admins for user reply on ticket {}: {}", ticket.getTicketId(), ex.getMessage());
        }

        return mapToMessageResponse(savedMessage);
    }

    public List<TicketMessageResponse> getMessages(String ticketId, UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = supportTicketRepository.findByTicketIdAndUserIdAndIsDeletedFalse(ticketId, user.getId())
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));

        return supportTicketMessageRepository.findByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(ticket.getId())
                .stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    // ==========================================
    // Part 11: Admin Operations
    // ==========================================
    
    public List<SupportTicketResponse> getAllTicketsAdmin(TicketStatus status, TicketPriority priority, TicketCategory category, String search) {
        return supportTicketRepository.findByFilters(status, priority, category, search)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public SupportTicketResponse getTicketByTicketIdAdmin(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findByTicketIdAndIsDeletedFalse(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));
        return mapToResponse(ticket);
    }

    public List<TicketMessageResponse> getMessagesAdmin(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findByTicketIdAndIsDeletedFalse(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));

        return supportTicketMessageRepository.findByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(ticket.getId())
                .stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    @Transactional
    public TicketMessageResponse addAdminMessage(String ticketId, CreateTicketMessageRequest request, UUID adminSupabaseUserId) {
        User admin = userRepository.findBySupabaseUserIdAndIsDeletedFalse(adminSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        SupportTicket ticket = supportTicketRepository.findByTicketIdAndIsDeletedFalse(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));

        SupportTicketMessage message = SupportTicketMessage.builder()
                .ticket(ticket)
                .sender(admin)
                .message(request.getMessage().trim())
                .senderType(MessageSenderType.SUPPORT)
                .build();

        message.setIsDeleted(false);
        SupportTicketMessage savedMessage = supportTicketMessageRepository.save(message);

        // Automatically update ticket status if waiting
        if (ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS) {
            ticket.setStatus(TicketStatus.WAITING_FOR_USER);
            supportTicketRepository.save(ticket);
        }
        
        // Notify User
        try {
            String title = "Support Team Replied";
            String msgText = "Update on ticket " + ticket.getTicketId();
            notifyUser(ticket.getUser(), title, msgText, "/support/tickets/" + ticket.getTicketId());
        } catch (Exception ex) {
            log.error("Failed to notify user for admin reply on ticket {}: {}", ticket.getTicketId(), ex.getMessage());
        }

        return mapToMessageResponse(savedMessage);
    }

    @Transactional
    public SupportTicketResponse updateTicketStatusAdmin(String ticketId, TicketStatus newStatus) {
        SupportTicket ticket = supportTicketRepository.findByTicketIdAndIsDeletedFalse(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));
        
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        
        if (oldStatus != newStatus) {
            try {
                String title = "Ticket Status Updated";
                String msgText = "Ticket " + ticketId + " is now " + newStatus.name();
                notifyUser(ticket.getUser(), title, msgText, "/support/tickets/" + ticketId);
            } catch (Exception ex) {
                log.error("Failed to notify user for status update on ticket {}: {}", ticketId, ex.getMessage());
            }
        }
        
        return mapToResponse(savedTicket);
    }

    @Transactional
    public SupportTicketResponse updateTicketPriorityAdmin(String ticketId, TicketPriority newPriority) {
        SupportTicket ticket = supportTicketRepository.findByTicketIdAndIsDeletedFalse(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));
                
        TicketPriority oldPriority = ticket.getPriority();
        ticket.setPriority(newPriority);
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        
        if (oldPriority != newPriority) {
            try {
                String title = "Ticket Priority Updated";
                String msgText = "Ticket " + ticketId + " priority changed to " + newPriority.name();
                notifyUser(ticket.getUser(), title, msgText, "/support/tickets/" + ticketId);
            } catch (Exception ex) {
                log.error("Failed to notify user for priority update on ticket {}: {}", ticketId, ex.getMessage());
            }
        }
        
        return mapToResponse(savedTicket);
    }

    private TicketMessageResponse mapToMessageResponse(SupportTicketMessage message) {
        return TicketMessageResponse.builder()
                .id(message.getId())
                .message(message.getMessage())
                .senderName(buildUserFullName(message.getSender()))
                .senderEmail(message.getSender() != null ? message.getSender().getEmail() : null)
                .senderType(message.getSenderType())
                .createdAt(message.getCreatedAt())
                .build();
    }
    
    private void notifyAdmins(String title, String message, String linkUrl) {
        List<User> admins = userRepository.findByRoleNameAndIsDeletedFalse(RoleType.ADMIN);
        for (User admin : admins) {
            notifyUser(admin, title, message, linkUrl);
        }
    }
    
    private void notifyUser(User user, String title, String message, String linkUrl) {
        if (user == null) return;
        notificationService.createNotification(user, title, message, NotificationType.SUPPORT_TICKET_UPDATE, linkUrl);
    }
}

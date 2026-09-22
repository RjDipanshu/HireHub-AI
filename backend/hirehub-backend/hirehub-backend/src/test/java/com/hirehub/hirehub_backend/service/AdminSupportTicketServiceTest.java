package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.support.CreateTicketMessageRequest;
import com.hirehub.hirehub_backend.dto.support.SupportTicketResponse;
import com.hirehub.hirehub_backend.dto.support.TicketMessageResponse;
import com.hirehub.hirehub_backend.entity.SupportTicket;
import com.hirehub.hirehub_backend.entity.SupportTicketMessage;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.MessageSenderType;
import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
import com.hirehub.hirehub_backend.repository.SupportTicketRepository;
import com.hirehub.hirehub_backend.repository.SupportTicketMessageRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminSupportTicketServiceTest {

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SupportTicketMessageRepository supportTicketMessageRepository;

    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SupportTicketService supportTicketService;

    private User adminUser;
    private User regularUser;
    private SupportTicket sampleTicket;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        ReflectionTestUtils.setField(adminUser, "id", UUID.randomUUID());
        adminUser.setSupabaseUserId(UUID.randomUUID());
        adminUser.setEmail("admin@hirehub.ai");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
                
        regularUser = new User();
        ReflectionTestUtils.setField(regularUser, "id", UUID.randomUUID());
        regularUser.setSupabaseUserId(UUID.randomUUID());
        regularUser.setEmail("user@example.com");
        regularUser.setFirstName("Regular");
        regularUser.setLastName("User");

        sampleTicket = SupportTicket.builder()
                .ticketId("HH-2026-000100")
                .user(regularUser)
                .subject("Test Subject")
                .description("Test Description")
                .category(TicketCategory.ACCOUNT)
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .build();
        ReflectionTestUtils.setField(sampleTicket, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(sampleTicket, "createdAt", LocalDateTime.now());
        ReflectionTestUtils.setField(sampleTicket, "updatedAt", LocalDateTime.now());
    }

    @Test
    void getAllTicketsAdmin_ShouldReturnAllTicketsWithoutOwnershipCheck() {
        // Arrange
        when(supportTicketRepository.findByFilters(null, null, null, null))
                .thenReturn(List.of(sampleTicket));

        // Act
        List<SupportTicketResponse> responses = supportTicketService.getAllTicketsAdmin(null, null, null, null);

        // Assert
        assertEquals(1, responses.size());
        assertEquals("HH-2026-000100", responses.get(0).getTicketId());
        assertEquals("Regular User", responses.get(0).getUserName());
        verify(supportTicketRepository).findByFilters(null, null, null, null);
    }

    @Test
    void getTicketByTicketIdAdmin_ShouldReturnTicketWithoutOwnershipCheck() {
        // Arrange
        when(supportTicketRepository.findByTicketIdAndIsDeletedFalse("HH-2026-000100"))
                .thenReturn(Optional.of(sampleTicket));

        // Act
        SupportTicketResponse response = supportTicketService.getTicketByTicketIdAdmin("HH-2026-000100");

        // Assert
        assertNotNull(response);
        assertEquals("HH-2026-000100", response.getTicketId());
        verify(supportTicketRepository).findByTicketIdAndIsDeletedFalse("HH-2026-000100");
    }

    @Test
    void addAdminMessage_ShouldAddSupportMessageAndChangeStatusToWaitingForUser() {
        // Arrange
        CreateTicketMessageRequest request = new CreateTicketMessageRequest("Admin reply text");
        
        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(adminUser.getSupabaseUserId()))
                .thenReturn(Optional.of(adminUser));
        when(supportTicketRepository.findByTicketIdAndIsDeletedFalse("HH-2026-000100"))
                .thenReturn(Optional.of(sampleTicket));
                
        SupportTicketMessage savedMessage = SupportTicketMessage.builder()
                .ticket(sampleTicket)
                .sender(adminUser)
                .message("Admin reply text")
                .senderType(MessageSenderType.SUPPORT)
                .build();
        ReflectionTestUtils.setField(savedMessage, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(savedMessage, "createdAt", LocalDateTime.now());
                
        when(supportTicketMessageRepository.save(any(SupportTicketMessage.class)))
                .thenReturn(savedMessage);

        // Act
        TicketMessageResponse response = supportTicketService.addAdminMessage("HH-2026-000100", request, adminUser.getSupabaseUserId());

        // Assert
        assertNotNull(response);
        assertEquals("Admin reply text", response.getMessage());
        assertEquals(MessageSenderType.SUPPORT, response.getSenderType());
        assertEquals(TicketStatus.WAITING_FOR_USER, sampleTicket.getStatus()); // Verify status auto-update
        
        verify(supportTicketMessageRepository).save(any(SupportTicketMessage.class));
        verify(supportTicketRepository).save(sampleTicket); // Verifies ticket was saved due to status change
    }

    @Test
    void updateTicketStatusAdmin_ShouldUpdateStatus() {
        // Arrange
        when(supportTicketRepository.findByTicketIdAndIsDeletedFalse("HH-2026-000100"))
                .thenReturn(Optional.of(sampleTicket));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        SupportTicketResponse response = supportTicketService.updateTicketStatusAdmin("HH-2026-000100", TicketStatus.RESOLVED);

        // Assert
        assertNotNull(response);
        assertEquals(TicketStatus.RESOLVED, response.getStatus());
        verify(supportTicketRepository).save(sampleTicket);
    }
    
    @Test
    void updateTicketPriorityAdmin_ShouldUpdatePriority() {
        // Arrange
        when(supportTicketRepository.findByTicketIdAndIsDeletedFalse("HH-2026-000100"))
                .thenReturn(Optional.of(sampleTicket));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        SupportTicketResponse response = supportTicketService.updateTicketPriorityAdmin("HH-2026-000100", TicketPriority.URGENT);

        // Assert
        assertNotNull(response);
        assertEquals(TicketPriority.URGENT, response.getPriority());
        verify(supportTicketRepository).save(sampleTicket);
    }
}

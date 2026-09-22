package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.support.CreateSupportTicketRequest;
import com.hirehub.hirehub_backend.dto.support.SupportTicketResponse;
import com.hirehub.hirehub_backend.entity.SupportTicket;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
import com.hirehub.hirehub_backend.exception.TicketCreationException;
import com.hirehub.hirehub_backend.repository.SupportTicketRepository;
import com.hirehub.hirehub_backend.repository.SupportTicketMessageRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Year;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupportTicketServiceTest {

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private SupportTicketMessageRepository supportTicketMessageRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SupportTicketService supportTicketService;

    private User testUser;
    private UUID supabaseUserId;

    @BeforeEach
    void setUp() {
        supabaseUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setSupabaseUserId(supabaseUserId);
        testUser.setEmail("developer@hirehub.ai");
        testUser.setFirstName("Dev");
        testUser.setLastName("User");
    }

    @Test
    @DisplayName("A. First ticket: Generates HH-YYYY-000001 when sequence starts at 1")
    void testGenerateUniqueTicketId_FirstTicket() {
        int currentYear = Year.now().getValue();
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(1L);

        String ticketId = supportTicketService.generateUniqueTicketId();

        assertEquals(String.format("HH-%d-000001", currentYear), ticketId);
    }

    @Test
    @DisplayName("B. Multiple tickets: Successive sequence calls generate unique monotonic ticket IDs")
    void testGenerateUniqueTicketId_MultipleTickets_Unique() {
        int currentYear = Year.now().getValue();
        when(supportTicketRepository.getNextTicketSequenceValue())
                .thenReturn(1L, 2L, 3L, 25L, 999999L);

        String id1 = supportTicketService.generateUniqueTicketId();
        String id2 = supportTicketService.generateUniqueTicketId();
        String id3 = supportTicketService.generateUniqueTicketId();
        String id4 = supportTicketService.generateUniqueTicketId();
        String id5 = supportTicketService.generateUniqueTicketId();

        assertEquals(String.format("HH-%d-000001", currentYear), id1);
        assertEquals(String.format("HH-%d-000002", currentYear), id2);
        assertEquals(String.format("HH-%d-000003", currentYear), id3);
        assertEquals(String.format("HH-%d-000025", currentYear), id4);
        assertEquals(String.format("HH-%d-999999", currentYear), id5);

        Set<String> uniqueIds = Set.of(id1, id2, id3, id4, id5);
        assertEquals(5, uniqueIds.size(), "All generated IDs must be unique");
    }

    @Test
    @DisplayName("C. Concurrent ticket creation: Multiple threads generate distinct non-colliding IDs")
    void testGenerateUniqueTicketId_Concurrency() throws InterruptedException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        Set<String> generatedIds = ConcurrentHashMap.newKeySet();

        // In fallback/atomic counter mode (simulating isolated concurrent worker progression)
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(null);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    String id = supportTicketService.generateUniqueTicketId();
                    generatedIds.add(id);
                } catch (Exception e) {
                    fail("Thread execution failed: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown();
        boolean completed = doneLatch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All threads must complete within timeout");
        assertEquals(threadCount, generatedIds.size(), "Each concurrent worker must generate a unique ID");
    }

    @Test
    @DisplayName("D. Database uniqueness: Collision triggers retry or graceful exception")
    void testCreateTicket_DatabaseCollision_RetriesAndSucceeds() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Payment gateway timeout")
                .description("Card was charged but invoice still displays unpaid status.")
                .category(TicketCategory.PAYMENTS)
                .priority(TicketPriority.HIGH)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue())
                .thenReturn(10L, 11L);

        // First attempt collides, second attempt succeeds
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate key violation"))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);
        assertTrue(response.getTicketId().endsWith("000011"));
        verify(supportTicketRepository, times(2)).saveAndFlush(any(SupportTicket.class));
    }

    @Test
    @DisplayName("D2. Database uniqueness: Exhausted retries throw clean TicketCreationException")
    void testCreateTicket_ExhaustedRetries_ThrowsTicketCreationException() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Persistent collision issue")
                .description("Detailed description for ticket creation failure test.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.LOW)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue())
                .thenReturn(100L, 101L, 102L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate key violation"));

        assertThrows(TicketCreationException.class, () ->
                supportTicketService.createTicket(request, supabaseUserId));
    }

    @Test
    @DisplayName("E. Rollback: Failed transactions do not block or cause future duplicate IDs (sequence gap accepted)")
    void testRollbackAcceptsSequenceGaps() {
        int currentYear = Year.now().getValue();
        // Simulating sequence value 5 (rolled back), then sequence value 6 (succeeded)
        when(supportTicketRepository.getNextTicketSequenceValue())
                .thenReturn(5L, 6L);

        String id1 = supportTicketService.generateUniqueTicketId(); // Transaction 1 (aborted)
        String id2 = supportTicketService.generateUniqueTicketId(); // Transaction 2 (committed)

        assertEquals(String.format("HH-%d-000005", currentYear), id1);
        assertEquals(String.format("HH-%d-000006", currentYear), id2);
        assertNotEquals(id1, id2);
    }

    @Test
    @DisplayName("G. Format: Verify ticketId matches HH-YYYY-XXXXXX regex")
    void testTicketIdFormatPattern() {
        Pattern pattern = Pattern.compile("^HH-\\d{4}-\\d{6}$");

        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(7L);
        String ticketId = supportTicketService.generateUniqueTicketId();

        assertTrue(pattern.matcher(ticketId).matches(),
                "Ticket ID '" + ticketId + "' must strictly match HH-YYYY-XXXXXX");
    }

    @Test
    @DisplayName("createTicket - Saves and returns mapped response")
    void testCreateTicket_Success() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Billing issue inquiry")
                .description("Inquiry regarding monthly subscription invoice receipt.")
                .category(TicketCategory.PAYMENTS)
                .priority(TicketPriority.MEDIUM)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(1L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);
        assertNotNull(response.getTicketId());
        assertEquals("Billing issue inquiry", response.getSubject());
        assertEquals(TicketCategory.PAYMENTS, response.getCategory());
        assertEquals(TicketPriority.MEDIUM, response.getPriority());
        assertEquals(TicketStatus.OPEN, response.getStatus());
        verify(supportTicketRepository, times(1)).saveAndFlush(any(SupportTicket.class));
    }

    @Test
    @DisplayName("getMyTicketByTicketId - Throws exception when ticket belongs to another user")
    void testGetMyTicketByTicketId_NotFoundOrForbidden() {
        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.findByTicketIdAndUserIdAndIsDeletedFalse("HH-2026-999999", testUser.getId()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                supportTicketService.getMyTicketByTicketId("HH-2026-999999", supabaseUserId));
    }

    @Test
    @DisplayName("Part 8: createTicket successfully triggers confirmation email with trusted user credentials")
    void testCreateTicket_TriggersConfirmationEmail() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Unable to upload resume")
                .description("Getting 500 error when uploading PDF resume.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.HIGH)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(15L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);
        assertEquals("HH-" + Year.now().getValue() + "-000015", response.getTicketId());

        // Verify confirmation email was dispatched with user's trusted email, name, and ticket details
        verify(emailNotificationService, times(1)).sendSupportTicketConfirmation(
                eq("developer@hirehub.ai"),
                eq("Dev"),
                eq(response.getTicketId()),
                eq("Unable to upload resume"),
                eq("TECHNICAL"),
                eq("HIGH"),
                eq("OPEN"),
                any()
        );
    }

    @Test
    @DisplayName("Part 8: Email sending failure does NOT cause ticket creation to fail or roll back")
    void testCreateTicket_EmailFailure_DoesNotFailTicketCreation() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Cannot reset password")
                .description("Reset email is not arriving in inbox.")
                .category(TicketCategory.ACCOUNT)
                .priority(TicketPriority.MEDIUM)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(20L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Simulate SMTP failure / network drop
        doThrow(new RuntimeException("SMTP connection timed out"))
                .when(emailNotificationService).sendSupportTicketConfirmation(
                        anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any()
                );

        // Ticket creation must still succeed despite email failure
        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);
        assertEquals("Cannot reset password", response.getSubject());
        assertEquals("HH-" + Year.now().getValue() + "-000020", response.getTicketId());
        verify(supportTicketRepository, times(1)).saveAndFlush(any(SupportTicket.class));
    }

    @Test
    @DisplayName("Part 8: Ticket persistence failure does NOT send confirmation email")
    void testCreateTicket_PersistenceFailure_DoesNotSendEmail() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Database constraint collision")
                .description("Simulate DB error on all attempts.")
                .category(TicketCategory.PROFILE)
                .priority(TicketPriority.LOW)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(50L, 51L, 52L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class)))
                .thenThrow(new DataIntegrityViolationException("Database constraint failure"));

        assertThrows(TicketCreationException.class, () ->
                supportTicketService.createTicket(request, supabaseUserId));

        // Verify email was never attempted because ticket persistence failed
        verifyNoInteractions(emailNotificationService);
    }

    @Test
    @DisplayName("Part 9: createTicket triggers support-team notification email with trusted data")
    void testCreateTicket_TriggersSupportTeamNotification() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Broken search feature")
                .description("Search returns no results for any query.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.HIGH)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(30L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);

        // Verify support-team notification was dispatched with ticket details and user info
        verify(emailNotificationService, times(1)).sendSupportTeamNotification(
                eq(response.getTicketId()),
                eq("Broken search feature"),
                eq("Search returns no results for any query."),
                eq("TECHNICAL"),
                eq("HIGH"),
                eq("OPEN"),
                any(),
                eq("Dev User"),
                eq("developer@hirehub.ai")
        );
    }

    @Test
    @DisplayName("Part 9: Support-team notification failure does NOT fail ticket creation")
    void testCreateTicket_TeamNotificationFailure_DoesNotFailTicket() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Notification resilience test")
                .description("Team email SMTP times out.")
                .category(TicketCategory.ACCOUNT)
                .priority(TicketPriority.LOW)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(31L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Simulate team notification failure while user confirmation succeeds
        doThrow(new RuntimeException("SMTP team notification failed"))
                .when(emailNotificationService).sendSupportTeamNotification(
                        anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any(), anyString(), anyString()
                );

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);
        assertEquals("HH-" + Year.now().getValue() + "-000031", response.getTicketId());
        // User confirmation should still have been called
        verify(emailNotificationService, times(1)).sendSupportTicketConfirmation(
                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any()
        );
    }

    @Test
    @DisplayName("Part 9: Ticket persistence failure does NOT send team notification")
    void testCreateTicket_PersistenceFailure_DoesNotSendTeamNotification() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Persistence failure test for team notification")
                .description("DB fails on all retries.")
                .category(TicketCategory.TECHNICAL)
                .priority(TicketPriority.MEDIUM)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(60L, 61L, 62L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class)))
                .thenThrow(new DataIntegrityViolationException("DB down"));

        assertThrows(TicketCreationException.class, () ->
                supportTicketService.createTicket(request, supabaseUserId));

        // Neither user confirmation nor team notification should be sent
        verifyNoInteractions(emailNotificationService);
    }

    @Test
    @DisplayName("Part 9: Both user confirmation and team notification are dispatched on success")
    void testCreateTicket_BothEmailsDispatched() {
        CreateSupportTicketRequest request = CreateSupportTicketRequest.builder()
                .subject("Dual email dispatch test")
                .description("Testing both emails fire on successful creation.")
                .category(TicketCategory.PAYMENTS)
                .priority(TicketPriority.MEDIUM)
                .build();

        when(userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId))
                .thenReturn(Optional.of(testUser));
        when(supportTicketRepository.getNextTicketSequenceValue()).thenReturn(32L);
        when(supportTicketRepository.saveAndFlush(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketResponse response = supportTicketService.createTicket(request, supabaseUserId);

        assertNotNull(response);

        // Both methods should be called exactly once per successful ticket
        verify(emailNotificationService, times(1)).sendSupportTicketConfirmation(
                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any()
        );
        verify(emailNotificationService, times(1)).sendSupportTeamNotification(
                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any(), anyString(), anyString()
        );
    }
}

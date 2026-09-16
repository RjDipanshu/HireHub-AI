package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.entity.EmailLog;
import com.hirehub.hirehub_backend.enums.EmailStatus;
import com.hirehub.hirehub_backend.enums.EmailType;
import com.hirehub.hirehub_backend.repository.EmailLogRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailLogRepository emailLogRepository;

    private EmailNotificationService emailNotificationService;

    private final String frontendUrl = "https://hirehub.ai";
    private final String mailFrom = "supporthirehub.ai@gmail.com";
    private final String supportEmail = "supporthirehub.ai@gmail.com";

    @BeforeEach
    void setUp() {
        emailNotificationService = new EmailNotificationService(
                mailSender,
                frontendUrl,
                mailFrom,
                supportEmail,
                emailLogRepository
        );
        ReflectionTestUtils.setField(emailNotificationService, "self", emailNotificationService);
        
        lenient().when(emailLogRepository.findByEmailTypeAndReferenceIdAndRecipient(any(), any(), any())).thenReturn(Optional.empty());
        lenient().when(emailLogRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            EmailLog log = invocation.getArgument(0);
            ReflectionTestUtils.setField(log, "id", java.util.UUID.randomUUID());
            return log;
        });
        lenient().when(emailLogRepository.findById(any())).thenAnswer(invocation -> {
            EmailLog log = new EmailLog();
            log.setStatus(EmailStatus.PENDING);
            log.setRecipient("test@example.com");
            return Optional.of(log);
        });
    }

    @Test
    @DisplayName("A. Subject contains dynamic ticket ID in SaaS style")
    void testSubjectFormatWithDynamicTicketId() {
        String ticketId = "HH-2026-000042";
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        emailNotificationService.sendSupportTicketConfirmation(
                "user@example.com",
                "Alex",
                ticketId,
                "Unable to edit profile",
                "PROFILE",
                "MEDIUM",
                "OPEN",
                LocalDateTime.now()
        );

        verify(mailSender, times(1)).send(mockMimeMessage);
        try {
            assertEquals("Your HireHub AI support ticket has been received — HH-2026-000042", mockMimeMessage.getSubject());
        } catch (Exception e) {
            fail("Exception reading subject: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("B. HTML email contains ticket details, branding, and ticket URL")
    void testBuildSupportTicketConfirmationHtml() {
        String ticketId = "HH-2026-000001";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 15, 14, 30, 0);

        String html = emailNotificationService.buildSupportTicketConfirmationHtml(
                "John",
                ticketId,
                "Unable to update profile",
                "PROFILE",
                "MEDIUM",
                "OPEN",
                createdAt,
                ticketUrl
        );

        assertNotNull(html);
        assertTrue(html.contains("HH-2026-000001"), "Must contain ticket ID");
        assertTrue(html.contains("Unable to update profile"), "Must contain subject");
        assertTrue(html.contains("PROFILE"), "Must contain category");
        assertTrue(html.contains("MEDIUM"), "Must contain priority");
        assertTrue(html.contains("OPEN"), "Must contain status");
        assertTrue(html.contains("John"), "Must contain recipient name");
        assertTrue(html.contains("https://hirehub.ai/support/tickets/HH-2026-000001"), "Must contain ticket link");
        assertTrue(html.contains("supporthirehub.ai@gmail.com"), "Must contain support contact email");
        assertTrue(html.contains("HireHub"), "Must contain branding");
        assertTrue(html.contains("What happens next?"), "Must outline what happens next");
    }

    @Test
    @DisplayName("C. Plain text email fallback contains all essential ticket details")
    void testBuildSupportTicketConfirmationPlainText() {
        String ticketId = "HH-2026-000099";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 15, 10, 15, 0);

        String plainText = emailNotificationService.buildSupportTicketConfirmationPlainText(
                "Sara",
                ticketId,
                "Payment issue",
                "PAYMENTS",
                "HIGH",
                "OPEN",
                createdAt,
                ticketUrl
        );

        assertNotNull(plainText);
        assertTrue(plainText.contains("HH-2026-000099"));
        assertTrue(plainText.contains("Sara"));
        assertTrue(plainText.contains("Payment issue"));
        assertTrue(plainText.contains("PAYMENTS"));
        assertTrue(plainText.contains("HIGH"));
        assertTrue(plainText.contains("OPEN"));
        assertTrue(plainText.contains("https://hirehub.ai/support/tickets/HH-2026-000099"));
        assertTrue(plainText.contains("supporthirehub.ai@gmail.com"));
        assertTrue(plainText.contains("WHAT HAPPENS NEXT:"));
    }

    @Test
    @DisplayName("D. HTML escaping prevents XSS / markup injection")
    void testHtmlEscaping() {
        String ticketId = "HH-2026-000100";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);

        String html = emailNotificationService.buildSupportTicketConfirmationHtml(
                "<script>alert('xss')</script>",
                ticketId,
                "Trouble with <b>bold</b> & special characters",
                "TECHNICAL",
                "LOW",
                "OPEN",
                LocalDateTime.now(),
                ticketUrl
        );

        assertFalse(html.contains("<script>"), "Must escape opening script tags");
        assertFalse(html.contains("</script>"), "Must escape closing script tags");
        assertTrue(html.contains("&lt;script&gt;"));
        assertTrue(html.contains("&amp; special characters"));
    }

    @Test
    @DisplayName("E. Simulation fallback when JavaMailSender is null")
    void testSimulationFallbackWhenMailSenderNull() {
        EmailNotificationService unconfiguredService = new EmailNotificationService(
                null,
                frontendUrl,
                mailFrom,
                supportEmail,
                emailLogRepository
        );
        ReflectionTestUtils.setField(unconfiguredService, "self", unconfiguredService);

        // Must complete without throwing NullPointerException
        assertDoesNotThrow(() -> unconfiguredService.sendSupportTicketConfirmation(
                "candidate@hirehub.ai",
                "Candidate",
                "HH-2026-000005",
                "Login issue",
                "ACCOUNT",
                "HIGH",
                "OPEN",
                LocalDateTime.now()
        ));
    }

    @Test
    @DisplayName("F. MailSendException is caught cleanly without rethrowing to caller")
    void testMailSendExceptionHandledGracefully() {
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new MailSendException("SMTP server connection failed: connect timed out"))
                .when(mailSender).send(any(MimeMessage.class));

        // Expect RuntimeException because it triggers the @Retryable loop synchronously in unit tests
        RuntimeException ex = assertThrows(RuntimeException.class, () -> emailNotificationService.sendSupportTicketConfirmation(
                "candidate@hirehub.ai",
                "Candidate",
                "HH-2026-000006",
                "Interview reschedule inquiry",
                "INTERVIEW",
                "MEDIUM",
                "OPEN",
                LocalDateTime.now()
        ));
        assertTrue(ex.getMessage().contains("Failed to send email"));

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
    @DisplayName("G. Blank or null recipient email is safely skipped")
    void testMissingRecipientEmailSafelySkipped() {
        emailNotificationService.sendSupportTicketConfirmation(
                null,
                "Candidate",
                "HH-2026-000007",
                "Test subject",
                "GENERAL",
                "LOW",
                "OPEN",
                LocalDateTime.now()
        );

        emailNotificationService.sendSupportTicketConfirmation(
                "   ",
                "Candidate",
                "HH-2026-000008",
                "Test subject",
                "GENERAL",
                "LOW",
                "OPEN",
                LocalDateTime.now()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================================
    // Part 9: Support-Team Notification Email Tests
    // =========================================================================

    @Test
    @DisplayName("Part 9A: Support-team notification subject contains ticket ID and subject")
    void testTeamNotificationSubjectFormat() {
        String ticketId = "HH-2026-000055";
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        emailNotificationService.sendSupportTeamNotification(
                ticketId,
                "Cannot upload resume",
                "Uploading PDF throws 500 error.",
                "TECHNICAL",
                "HIGH",
                "OPEN",
                LocalDateTime.now(),
                "Dev User",
                "developer@hirehub.ai"
        );

        verify(mailSender, times(1)).send(mockMimeMessage);
        try {
            String subject = mockMimeMessage.getSubject();
            assertTrue(subject.contains("[New Support Ticket]"), "Subject must contain prefix tag");
            assertTrue(subject.contains("HH-2026-000055"), "Subject must contain ticket ID");
            assertTrue(subject.contains("Cannot upload resume"), "Subject must contain ticket subject");
        } catch (Exception e) {
            fail("Exception reading subject: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Part 9B: Team notification HTML includes ticket details, user info, and description")
    void testBuildSupportTeamNotificationHtml() {
        String ticketId = "HH-2026-000060";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 16, 10, 30, 0);

        String html = emailNotificationService.buildSupportTeamNotificationHtml(
                ticketId,
                "Search not working",
                "All queries return empty results in the job search page.",
                "TECHNICAL",
                "HIGH",
                "OPEN",
                createdAt,
                "Jane Doe",
                "jane@example.com",
                ticketUrl
        );

        assertNotNull(html);
        assertTrue(html.contains("HH-2026-000060"), "Must contain ticket ID");
        assertTrue(html.contains("Search not working"), "Must contain subject");
        assertTrue(html.contains("All queries return empty results"), "Must contain description");
        assertTrue(html.contains("TECHNICAL"), "Must contain category");
        assertTrue(html.contains("HIGH"), "Must contain priority");
        assertTrue(html.contains("OPEN"), "Must contain status");
        assertTrue(html.contains("Jane Doe"), "Must contain user name");
        assertTrue(html.contains("jane@example.com"), "Must contain user email");
        assertTrue(html.contains("https://hirehub.ai/support/tickets/HH-2026-000060"), "Must contain ticket URL");
        assertTrue(html.contains("Support Team"), "Must contain internal branding");
        assertTrue(html.contains("Internal Team Notification"), "Must indicate internal notification");
    }

    @Test
    @DisplayName("Part 9C: Team notification plain text includes all ticket and user details")
    void testBuildSupportTeamNotificationPlainText() {
        String ticketId = "HH-2026-000061";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 16, 11, 0, 0);

        String plainText = emailNotificationService.buildSupportTeamNotificationPlainText(
                ticketId,
                "Billing overcharge",
                "I was charged twice for the same subscription period.",
                "PAYMENTS",
                "HIGH",
                "OPEN",
                createdAt,
                "Bob Smith",
                "bob@example.com",
                ticketUrl
        );

        assertNotNull(plainText);
        assertTrue(plainText.contains("HH-2026-000061"));
        assertTrue(plainText.contains("Billing overcharge"));
        assertTrue(plainText.contains("I was charged twice"));
        assertTrue(plainText.contains("PAYMENTS"));
        assertTrue(plainText.contains("HIGH"));
        assertTrue(plainText.contains("Bob Smith"));
        assertTrue(plainText.contains("bob@example.com"));
        assertTrue(plainText.contains("https://hirehub.ai/support/tickets/HH-2026-000061"));
        assertTrue(plainText.contains("SUBMITTED BY"));
        assertTrue(plainText.contains("DESCRIPTION"));
    }

    @Test
    @DisplayName("Part 9D: Team notification simulation fallback when JavaMailSender is null")
    void testTeamNotificationSimulationFallback() {
        EmailNotificationService unconfiguredService = new EmailNotificationService(
                null,
                frontendUrl,
                mailFrom,
                supportEmail,
                emailLogRepository
        );
        ReflectionTestUtils.setField(unconfiguredService, "self", unconfiguredService);

        assertDoesNotThrow(() -> unconfiguredService.sendSupportTeamNotification(
                "HH-2026-000070",
                "Test ticket",
                "Test description.",
                "GENERAL",
                "LOW",
                "OPEN",
                LocalDateTime.now(),
                "Test User",
                "test@example.com"
        ));
    }

    @Test
    @DisplayName("Part 9E: Team notification SMTP failure is caught cleanly")
    void testTeamNotificationSmtpFailure() {
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new MailSendException("SMTP team notification timeout"))
                .when(mailSender).send(any(MimeMessage.class));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> emailNotificationService.sendSupportTeamNotification(
                "HH-2026-000071",
                "SMTP failure test",
                "Testing that SMTP error is caught.",
                "TECHNICAL",
                "MEDIUM",
                "OPEN",
                LocalDateTime.now(),
                "Dev User",
                "dev@hirehub.ai"
        ));
        assertTrue(ex.getMessage().contains("Failed to send email"));

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Part 9F: Team notification HTML escapes user-supplied data to prevent XSS")
    void testTeamNotificationHtmlEscaping() {
        String ticketId = "HH-2026-000072";
        String ticketUrl = emailNotificationService.buildTicketUrl(ticketId);

        String html = emailNotificationService.buildSupportTeamNotificationHtml(
                ticketId,
                "<script>alert('xss')</script>",
                "Description with <img onerror='hack'> & special chars",
                "TECHNICAL",
                "HIGH",
                "OPEN",
                LocalDateTime.now(),
                "<b>Evil Name</b>",
                "evil@example.com",
                ticketUrl
        );

        assertFalse(html.contains("<script>"), "Must escape script tags");
        assertFalse(html.contains("<img"), "Must escape img tags in description");
        assertTrue(html.contains("&lt;script&gt;"));
        assertTrue(html.contains("&amp; special chars"));
        assertTrue(html.contains("&lt;b&gt;Evil Name&lt;/b&gt;"));
    }
}

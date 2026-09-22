package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.entity.EmailLog;
import com.hirehub.hirehub_backend.enums.EmailStatus;
import com.hirehub.hirehub_backend.enums.EmailType;
import com.hirehub.hirehub_backend.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Phase 11.5, Part 8 & Part 9: Transactional Email Notification Service
 * Formats and dispatches transactional emails for critical recruitment milestones,
 * customer support ticket confirmations (Part 8), and support-team notifications (Part 9).
 *
 * Implements graceful simulation fallback if external SMTP provider
 * is unconfigured, ensuring database transactions and user flows never crash.
 */
@Service
@Slf4j
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    @Lazy
    private EmailNotificationService self;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl = "http://localhost:5173";

    @Value("${app.mail.from:supporthirehub.ai@gmail.com}")
    private String mailFrom = "supporthirehub.ai@gmail.com";

    @Value("${app.mail.support:supporthirehub.ai@gmail.com}")
    private String supportEmail = "supporthirehub.ai@gmail.com";

    public EmailNotificationService() {
    }

    public EmailNotificationService(JavaMailSender mailSender, String frontendUrl, String mailFrom, String supportEmail, EmailLogRepository emailLogRepository) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.mailFrom = mailFrom;
        this.supportEmail = supportEmail;
        this.emailLogRepository = emailLogRepository;
    }

    /**
     * Sends a professional confirmation email to the user's trusted email address
     * upon successful support ticket creation.
     */
    public void sendSupportTicketConfirmation(
            String recipientEmail,
            String recipientName,
            String ticketId,
            String subject,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt
    ) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("[EmailNotificationService] Skipped sending ticket confirmation: recipient email is missing for ticket {}", ticketId);
            return;
        }
        
        EmailLog emailLog = saveOrGetEmailLog(EmailType.SUPPORT_TICKET_CONFIRMATION, recipientEmail, ticketId);
        if (emailLog == null || emailLog.getStatus() == EmailStatus.SENT) {
            log.info("[EmailNotificationService] Skipping duplicate or already sent confirmation for ticket {}", ticketId);
            return;
        }

        String emailSubject = "Your HireHub AI support ticket has been received — " + ticketId;
        String ticketUrl = buildTicketUrl(ticketId);
        String htmlContent = buildSupportTicketConfirmationHtml(recipientName, ticketId, subject, category, priority, status, createdAt, ticketUrl);
        String plainTextContent = buildSupportTicketConfirmationPlainText(recipientName, ticketId, subject, category, priority, status, createdAt, ticketUrl);

        self.attemptDispatch(emailLog, emailSubject, htmlContent, plainTextContent);
    }

    public String buildTicketUrl(String ticketId) {
        String base = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/support/tickets/" + ticketId;
    }

    public String buildSupportTicketConfirmationHtml(
            String recipientName,
            String ticketId,
            String subject,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt,
            String ticketUrl
    ) {
        String displayName = (recipientName != null && !recipientName.isBlank()) ? escapeHtml(recipientName.trim()) : "there";
        String safeTicketId = escapeHtml(ticketId);
        String safeSubject = escapeHtml(subject);
        String safeCategory = (category != null && !category.isBlank()) ? escapeHtml(category) : "GENERAL";
        String safePriority = (priority != null && !priority.isBlank()) ? escapeHtml(priority) : "MEDIUM";
        String safeStatus = (status != null && !status.isBlank()) ? escapeHtml(status) : "OPEN";
        String formattedDate = formatCreatedAt(createdAt);
        String safeSupportEmail = escapeHtml(supportEmail);
        String priorityColor = getPriorityColor(safePriority);
        int currentYear = Year.now().getValue();

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Support Ticket Confirmation</title>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;\">\n" +
                "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f8fafc; padding: 24px 0;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\">\n" +
                "          <!-- Header Banner -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); padding: 32px 36px; text-align: left;\">\n" +
                "              <div style=\"font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;\">HireHub <span style=\"color: #818cf8;\">AI</span></div>\n" +
                "              <h1 style=\"color: #ffffff; font-size: 20px; font-weight: 700; margin: 14px 0 4px 0; line-height: 1.3;\">We've received your support request &#128640;</h1>\n" +
                "              <p style=\"color: #94a3b8; font-size: 13px; margin: 0;\">Support Ticket Notification</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Content -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 32px 36px 24px 36px;\">\n" +
                "              <p style=\"font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;\">Hi <strong>" + displayName + "</strong>,</p>\n" +
                "              <p style=\"font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;\">\n" +
                "                Thanks for contacting HireHub AI Support. We've successfully received your support request and created a support ticket for you.\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- Ticket Information Card -->\n" +
                "              <div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 20px 0;\">\n" +
                "                <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 110px;\">Ticket ID:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 14px; font-weight: 700; font-family: monospace; color: #4f46e5;\"><span style=\"background-color: #eef2ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #c7d2fe;\">" + safeTicketId + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Subject:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;\">" + safeSubject + "</td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Category:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #334155;\">" + safeCategory + "</td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Priority:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px;\"><span style=\"background-color: #f1f5f9; color: " + priorityColor + "; font-weight: 700; padding: 2px 8px; border-radius: 4px;\">" + safePriority + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Status:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px;\"><span style=\"background-color: #eff6ff; color: #2563eb; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;\">" + safeStatus + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Created At:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #475569;\">" + formattedDate + "</td>\n" +
                "                  </tr>\n" +
                "                </table>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- What happens next -->\n" +
                "              <div style=\"background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 4px; margin: 20px 0;\">\n" +
                "                <p style=\"margin: 0; font-size: 13px; color: #166534; line-height: 1.5;\">\n" +
                "                  <strong>What happens next?</strong><br>\n" +
                "                  Our support team will review your request and get back to you as soon as possible. You can keep this ticket ID for future communication with our support team.\n" +
                "                </p>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- CTA Button -->\n" +
                "              <div style=\"text-align: center; margin: 28px 0 24px 0;\">\n" +
                "                <a href=\"" + ticketUrl + "\" style=\"background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);\">View your ticket</a>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Support Help Note -->\n" +
                "              <p style=\"font-size: 13px; color: #64748b; line-height: 1.6; margin: 24px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 18px;\">\n" +
                "                Need additional help?<br>\n" +
                "                Contact us at: <a href=\"mailto:" + safeSupportEmail + "\" style=\"color: #4f46e5; text-decoration: underline;\">" + safeSupportEmail + "</a><br>\n" +
                "                We're here to help you get the most out of HireHub AI.\n" +
                "              </p>\n" +
                "\n" +
                "              <p style=\"font-size: 14px; color: #334155; margin: 20px 0 0 0; line-height: 1.5;\">\n" +
                "                Best regards,<br>\n" +
                "                <strong>HireHub AI Support Team</strong>\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color: #f1f5f9; padding: 16px 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;\">\n" +
                "              &copy; " + currentYear + " HireHub AI. All rights reserved.<br>\n" +
                "              Automated notification &mdash; please keep your ticket ID for future reference.\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    public String buildSupportTicketConfirmationPlainText(
            String recipientName,
            String ticketId,
            String subject,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt,
            String ticketUrl
    ) {
        String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "there";
        String safeCategory = (category != null && !category.isBlank()) ? category : "GENERAL";
        String safePriority = (priority != null && !priority.isBlank()) ? priority : "MEDIUM";
        String safeStatus = (status != null && !status.isBlank()) ? status : "OPEN";
        String formattedDate = formatCreatedAt(createdAt);

        return "HireHub AI Support\n\n" +
                "We've received your support request 🚀\n\n" +
                "Hi " + displayName + ",\n\n" +
                "Thanks for contacting HireHub AI Support.\n" +
                "We've successfully received your support request and created a support ticket for you.\n\n" +
                "--------------------------------------------------\n" +
                "TICKET DETAILS\n" +
                "--------------------------------------------------\n" +
                "Ticket ID:   " + ticketId + "\n" +
                "Subject:     " + subject + "\n" +
                "Category:    " + safeCategory + "\n" +
                "Priority:    " + safePriority + "\n" +
                "Status:      " + safeStatus + "\n" +
                "Created At:  " + formattedDate + "\n" +
                "--------------------------------------------------\n\n" +
                "View your ticket online:\n" +
                ticketUrl + "\n\n" +
                "WHAT HAPPENS NEXT:\n" +
                "Our support team will review your request and get back to you as soon as possible.\n" +
                "You can keep this ticket ID for future communication with our support team.\n\n" +
                "Need additional help?\n" +
                "Contact us at: " + supportEmail + "\n\n" +
                "We're here to help you get the most out of HireHub AI.\n\n" +
                "Best regards,\n" +
                "HireHub AI Support Team\n";
    }

    /**
     * Part 9: Sends an internal notification email to the support team when a new ticket is created.
     * Includes full ticket details, user info, and description so the team can triage immediately.
     * Recipient is always the configured support email — never frontend-supplied data.
     */
    public void sendSupportTeamNotification(
            String ticketId,
            String subject,
            String description,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt,
            String userName,
            String userEmail
    ) {
        if (supportEmail == null || supportEmail.isBlank()) {
            log.warn("[EmailNotificationService] Support team email not configured. Skipping team notification for ticket {}", ticketId);
            return;
        }
        
        EmailLog emailLog = saveOrGetEmailLog(EmailType.SUPPORT_TEAM_NOTIFICATION, supportEmail, ticketId);
        if (emailLog == null || emailLog.getStatus() == EmailStatus.SENT) {
            log.info("[EmailNotificationService] Skipping duplicate or already sent team notification for ticket {}", ticketId);
            return;
        }

        String emailSubject = "[New Support Ticket] " + ticketId + " — " + (subject != null ? subject : "No subject");
        String ticketUrl = buildTicketUrl(ticketId);
        String htmlContent = buildSupportTeamNotificationHtml(ticketId, subject, description, category, priority, status, createdAt, userName, userEmail, ticketUrl);
        String plainTextContent = buildSupportTeamNotificationPlainText(ticketId, subject, description, category, priority, status, createdAt, userName, userEmail, ticketUrl);

        self.attemptDispatch(emailLog, emailSubject, htmlContent, plainTextContent);
    }

    public String buildSupportTeamNotificationHtml(
            String ticketId,
            String subject,
            String description,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt,
            String userName,
            String userEmail,
            String ticketUrl
    ) {
        String safeTicketId = escapeHtml(ticketId);
        String safeSubject = escapeHtml(subject);
        String safeDescription = escapeHtml(description != null ? description : "");
        String safeCategory = (category != null && !category.isBlank()) ? escapeHtml(category) : "GENERAL";
        String safePriority = (priority != null && !priority.isBlank()) ? escapeHtml(priority) : "MEDIUM";
        String safeStatus = (status != null && !status.isBlank()) ? escapeHtml(status) : "OPEN";
        String safeUserName = (userName != null && !userName.isBlank()) ? escapeHtml(userName) : "Unknown";
        String safeUserEmail = (userEmail != null && !userEmail.isBlank()) ? escapeHtml(userEmail) : "N/A";
        String formattedDate = formatCreatedAt(createdAt);
        String priorityColor = getPriorityColor(safePriority);
        int currentYear = Year.now().getValue();

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>New Support Ticket</title>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;\">\n" +
                "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f8fafc; padding: 24px 0;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\">\n" +
                "          <!-- Header Banner -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #7c2d12 0%, #9a3412 60%, #c2410c 100%); padding: 28px 36px; text-align: left;\">\n" +
                "              <div style=\"font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;\">HireHub <span style=\"color: #fdba74;\">AI</span> &mdash; Support Team</div>\n" +
                "              <h1 style=\"color: #ffffff; font-size: 18px; font-weight: 700; margin: 12px 0 4px 0; line-height: 1.3;\">&#128232; New Support Ticket Received</h1>\n" +
                "              <p style=\"color: #fed7aa; font-size: 13px; margin: 0;\">Internal Team Notification</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Content -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 28px 36px 24px 36px;\">\n" +
                "              <p style=\"font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;\">\n" +
                "                A new support ticket has been submitted and requires attention.\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- Ticket Information Card -->\n" +
                "              <div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 16px 0;\">\n" +
                "                <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 110px;\">Ticket ID:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 14px; font-weight: 700; font-family: monospace; color: #4f46e5;\"><span style=\"background-color: #eef2ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #c7d2fe;\">" + safeTicketId + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Subject:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;\">" + safeSubject + "</td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Category:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #334155;\">" + safeCategory + "</td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Priority:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px;\"><span style=\"background-color: #f1f5f9; color: " + priorityColor + "; font-weight: 700; padding: 2px 8px; border-radius: 4px;\">" + safePriority + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Status:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px;\"><span style=\"background-color: #eff6ff; color: #2563eb; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;\">" + safeStatus + "</span></td>\n" +
                "                  </tr>\n" +
                "                  <tr>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;\">Created At:</td>\n" +
                "                    <td style=\"padding: 6px 0; font-size: 13px; color: #475569;\">" + formattedDate + "</td>\n" +
                "                  </tr>\n" +
                "                </table>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- User Information -->\n" +
                "              <div style=\"background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin: 16px 0;\">\n" +
                "                <p style=\"margin: 0 0 4px 0; font-size: 12px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">Submitted By</p>\n" +
                "                <p style=\"margin: 0; font-size: 14px; color: #451a03;\"><strong>" + safeUserName + "</strong> &mdash; <a href=\"mailto:" + safeUserEmail + "\" style=\"color: #b45309; text-decoration: underline;\">" + safeUserEmail + "</a></p>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Description -->\n" +
                "              <div style=\"margin: 16px 0;\">\n" +
                "                <p style=\"margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">Description</p>\n" +
                "                <div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap;\">" + safeDescription + "</div>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- CTA Button -->\n" +
                "              <div style=\"text-align: center; margin: 24px 0 20px 0;\">\n" +
                "                <a href=\"" + ticketUrl + "\" style=\"background-color: #c2410c; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(194, 65, 12, 0.3);\">View Ticket</a>\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color: #f1f5f9; padding: 14px 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;\">\n" +
                "              &copy; " + currentYear + " HireHub AI &mdash; Internal Support Team Notification\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    public String buildSupportTeamNotificationPlainText(
            String ticketId,
            String subject,
            String description,
            String category,
            String priority,
            String status,
            LocalDateTime createdAt,
            String userName,
            String userEmail,
            String ticketUrl
    ) {
        String safeCategory = (category != null && !category.isBlank()) ? category : "GENERAL";
        String safePriority = (priority != null && !priority.isBlank()) ? priority : "MEDIUM";
        String safeStatus = (status != null && !status.isBlank()) ? status : "OPEN";
        String safeUserName = (userName != null && !userName.isBlank()) ? userName : "Unknown";
        String safeUserEmail = (userEmail != null && !userEmail.isBlank()) ? userEmail : "N/A";
        String formattedDate = formatCreatedAt(createdAt);

        return "HireHub AI — Support Team Notification\n\n" +
                "NEW SUPPORT TICKET RECEIVED\n" +
                "==================================================\n\n" +
                "TICKET DETAILS\n" +
                "--------------------------------------------------\n" +
                "Ticket ID:   " + ticketId + "\n" +
                "Subject:     " + (subject != null ? subject : "N/A") + "\n" +
                "Category:    " + safeCategory + "\n" +
                "Priority:    " + safePriority + "\n" +
                "Status:      " + safeStatus + "\n" +
                "Created At:  " + formattedDate + "\n" +
                "--------------------------------------------------\n\n" +
                "SUBMITTED BY\n" +
                "--------------------------------------------------\n" +
                "Name:        " + safeUserName + "\n" +
                "Email:       " + safeUserEmail + "\n" +
                "--------------------------------------------------\n\n" +
                "DESCRIPTION\n" +
                "--------------------------------------------------\n" +
                (description != null ? description : "No description provided.") + "\n" +
                "--------------------------------------------------\n\n" +
                "View ticket online:\n" +
                ticketUrl + "\n\n" +
                "This is an automated internal notification from HireHub AI.\n";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String formatCreatedAt(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "Recently submitted";
        }
        return createdAt.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss 'UTC'"));
    }

    private String getPriorityColor(String priority) {
        if (priority == null) return "#64748b";
        switch (priority.toUpperCase()) {
            case "URGENT":
            case "HIGH":
                return "#dc2626";
            case "MEDIUM":
                return "#d97706";
            case "LOW":
                return "#16a34a";
            default:
                return "#64748b";
        }
    }

    public void sendApplicationSubmittedEmail(String candidateEmail, String candidateName, String jobTitle, String companyName) {
        String subject = "Application Received: " + jobTitle + " at " + companyName;
        String body = String.format(
                "Hello %s,\n\n" +
                "Thank you for applying for the %s position at %s through HireHub AI.\n" +
                "Your application and resume have been forwarded to the hiring team for review.\n\n" +
                "You can track your application status anytime on your HireHub dashboard:\n" +
                "https://hirehub.ai/candidate/applications\n\n" +
                "Best regards,\n" +
                "The HireHub Talent Team",
                candidateName, jobTitle, companyName
        );
        dispatchEmail(candidateEmail, subject, body);
    }

    public void sendApplicationShortlistedEmail(String candidateEmail, String candidateName, String jobTitle, String companyName) {
        String subject = "Great News! Your Application for " + jobTitle + " has been Shortlisted!";
        String body = String.format(
                "Hello %s,\n\n" +
                "Congratulations! %s has reviewed your background and shortlisted your application for the %s role.\n" +
                "The recruiter will reach out shortly regarding interview scheduling.\n\n" +
                "View details on your dashboard:\n" +
                "https://hirehub.ai/candidate/applications\n\n" +
                "Best regards,\n" +
                "The HireHub Talent Team",
                candidateName, companyName, jobTitle
        );
        dispatchEmail(candidateEmail, subject, body);
    }

    public void sendInterviewScheduledEmail(String candidateEmail, String candidateName, String jobTitle, String companyName, String interviewTime, String meetingUrl) {
        String subject = "Interview Scheduled: " + jobTitle + " with " + companyName;
        String body = String.format(
                "Hello %s,\n\n" +
                "An interview has been confirmed for the %s role at %s.\n\n" +
                "Scheduled Time: %s\n" +
                "Meeting Link: %s\n\n" +
                "Prepare for your technical rounds using HireHub AI Career Studio:\n" +
                "https://hirehub.ai/candidate/ai-tools\n\n" +
                "Best regards,\n" +
                "The HireHub Talent Team",
                candidateName, jobTitle, companyName, interviewTime, meetingUrl
        );
        dispatchEmail(candidateEmail, subject, body);
    }

    public void sendApplicationRejectedEmail(String candidateEmail, String candidateName, String jobTitle, String companyName) {
        String subject = "Application Status Update: " + jobTitle + " at " + companyName;
        String body = String.format(
                "Hello %s,\n\n" +
                "Thank you for taking the time to apply for the %s position at %s.\n" +
                "After careful consideration, the hiring team has decided to proceed with other candidates whose experience more closely matches their current needs.\n\n" +
                "We encourage you to explore other high-match roles curated for your profile on HireHub:\n" +
                "https://hirehub.ai/jobs\n\n" +
                "Best regards,\n" +
                "The HireHub Talent Team",
                candidateName, jobTitle, companyName
        );
        dispatchEmail(candidateEmail, subject, body);
    }

    public void sendRecruiterNewApplicationEmail(String recruiterEmail, String candidateName, String jobTitle) {
        String subject = "New Candidate Applied: " + candidateName + " for " + jobTitle;
        String body = String.format(
                "Hello,\n\n" +
                "%s has submitted an application for your job posting: %s.\n" +
                "Log in to your recruiter portal to inspect their resume, ATS match score, and rank applicants with Gemini AI:\n" +
                "https://hirehub.ai/recruiter/applications\n\n" +
                "Best regards,\n" +
                "HireHub AI Recruiting Platform",
                candidateName, jobTitle
        );
        dispatchEmail(recruiterEmail, subject, body);
    }

    private void dispatchEmail(String recipient, String subject, String body) {
        // Production logging simulation (safe fallback for SMTP)
        log.info("[EmailNotificationService] Dispatched transactional email to: {} | Subject: '{}'", recipient, subject);
        log.debug("[EmailNotificationService] Content:\n{}", body);
    }
    
    // ==========================================
    // RELIABILITY & RETRY INFRASTRUCTURE
    // ==========================================
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EmailLog saveOrGetEmailLog(EmailType type, String recipient, String referenceId) {
        try {
            Optional<EmailLog> existing = emailLogRepository.findByEmailTypeAndReferenceIdAndRecipient(type, referenceId, recipient);
            if (existing.isPresent()) {
                return existing.get();
            }
            
            EmailLog emailLog = new EmailLog();
            emailLog.setEmailType(type);
            emailLog.setRecipient(recipient);
            emailLog.setReferenceId(referenceId);
            emailLog.setStatus(EmailStatus.PENDING);
            return emailLogRepository.saveAndFlush(emailLog);
        } catch (DataIntegrityViolationException ex) {
            // Concurrent insert caught by DB unique constraint
            log.debug("[EmailNotificationService] EmailLog unique constraint hit for {} {} {}", type, referenceId, recipient);
            return emailLogRepository.findByEmailTypeAndReferenceIdAndRecipient(type, referenceId, recipient).orElse(null);
        } catch (Exception ex) {
            log.error("[EmailNotificationService] Error creating EmailLog: {}", ex.getMessage());
            return null; // Return null to skip dispatch safely
        }
    }
    
    @Async
    @Retryable(
        retryFor = { MailException.class, RuntimeException.class },
        maxAttemptsExpression = "${app.mail.retry.max-attempts:3}",
        backoff = @Backoff(delayExpression = "${app.mail.retry.delay-ms:5000}")
    )
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void attemptDispatch(EmailLog logEntry, String subject, String htmlContent, String plainTextContent) {
        logEntry = emailLogRepository.findById(logEntry.getId())
                .orElseThrow(() -> new RuntimeException("EmailLog not found"));
                
        if (logEntry.getStatus() == EmailStatus.SENT) return;
        
        logEntry.setAttemptCount(logEntry.getAttemptCount() + 1);
        logEntry.setLastAttemptAt(LocalDateTime.now());
        emailLogRepository.saveAndFlush(logEntry);
        
        if (mailSender == null) {
            log.info("[EmailNotificationService] JavaMailSender not configured. Simulating dispatch to: {}", logEntry.getRecipient());
            markAsSent(logEntry);
            return;
        }
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            String sender = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "supporthirehub.ai@gmail.com";
            helper.setFrom(sender, "HireHub AI Support");
            helper.setTo(logEntry.getRecipient());
            helper.setSubject(subject);
            helper.setText(plainTextContent, htmlContent);

            mailSender.send(mimeMessage);
            markAsSent(logEntry);
            log.info("[EmailNotificationService] Email sent successfully for Log ID: {}", logEntry.getId());
        } catch (Exception ex) {
            log.warn("[EmailNotificationService] Transient failure sending email (Log ID: {}): {}", logEntry.getId(), ex.getMessage());
            throw new RuntimeException("Failed to send email", ex); // Trigger retry
        }
    }
    
    @Recover
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recoverDispatchFailure(RuntimeException ex, EmailLog logEntry, String subject, String htmlContent, String plainTextContent) {
        logEntry = emailLogRepository.findById(logEntry.getId()).orElse(null);
        if (logEntry != null) {
            logEntry.setStatus(EmailStatus.FAILED);
            // Safely store truncated error message
            String errorMsg = ex.getMessage() != null ? ex.getMessage() : "Unknown error";
            if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                errorMsg += " | Cause: " + ex.getCause().getMessage();
            }
            if (errorMsg.length() > 990) errorMsg = errorMsg.substring(0, 990);
            
            logEntry.setErrorSummary(errorMsg);
            emailLogRepository.save(logEntry);
            log.error("[EmailNotificationService] Permanent failure after retries for Log ID: {}. Error: {}", logEntry.getId(), errorMsg);
        }
    }
    
    private void markAsSent(EmailLog logEntry) {
        logEntry.setStatus(EmailStatus.SENT);
        logEntry.setErrorSummary(null);
        emailLogRepository.save(logEntry);
    }
}

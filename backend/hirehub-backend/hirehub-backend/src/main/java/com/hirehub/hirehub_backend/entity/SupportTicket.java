package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.TicketCategory;
import com.hirehub.hirehub_backend.enums.TicketPriority;
import com.hirehub.hirehub_backend.enums.TicketStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "support_tickets",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_support_tickets_ticket_id", columnNames = {"ticket_id"})
    },
    indexes = {
        @Index(name = "idx_support_tickets_ticket_id", columnList = "ticket_id", unique = true),
        @Index(name = "idx_support_tickets_user_id", columnList = "user_id"),
        @Index(name = "idx_support_tickets_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket extends BaseEntity {

    @Pattern(regexp = "^HH-\\d{4}-\\d{6}$", message = "Ticket ID must match format HH-YYYY-XXXXXX")
    @Column(name = "ticket_id", nullable = false, unique = true, length = 32, updatable = false)
    private String ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;
}

package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.MessageSenderType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "support_ticket_messages",
    indexes = {
        @Index(name = "idx_support_ticket_msgs_ticket_id", columnList = "ticket_id"),
        @Index(name = "idx_support_ticket_msgs_sender_id", columnList = "sender_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicketMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotBlank(message = "Message content is required")
    @Size(max = 5000, message = "Message must not exceed 5000 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 32)
    @Builder.Default
    private MessageSenderType senderType = MessageSenderType.USER;
}

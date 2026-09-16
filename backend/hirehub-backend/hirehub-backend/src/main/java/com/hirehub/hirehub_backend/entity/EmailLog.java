package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.EmailStatus;
import com.hirehub.hirehub_backend.enums.EmailType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "email_logs",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email_type", "reference_id", "recipient"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "email_type", nullable = false)
    private EmailType emailType;

    @Column(nullable = false)
    private String recipient;

    @Column(name = "reference_id", nullable = false)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status = EmailStatus.PENDING;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private int maxAttempts = 3;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;

    @Column(name = "error_summary", length = 1000)
    private String errorSummary;
}

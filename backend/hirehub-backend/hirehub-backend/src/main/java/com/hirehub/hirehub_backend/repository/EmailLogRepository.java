package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.EmailLog;
import com.hirehub.hirehub_backend.enums.EmailType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {
    Optional<EmailLog> findByEmailTypeAndReferenceIdAndRecipient(EmailType emailType, String referenceId, String recipient);
}

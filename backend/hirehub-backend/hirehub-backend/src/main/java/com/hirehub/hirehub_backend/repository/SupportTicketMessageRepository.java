package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.SupportTicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportTicketMessageRepository extends JpaRepository<SupportTicketMessage, UUID> {
    List<SupportTicketMessage> findByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID ticketId);
}

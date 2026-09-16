package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {

    List<SupportTicket> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    Optional<SupportTicket> findByTicketIdAndIsDeletedFalse(String ticketId);

    Optional<SupportTicket> findByTicketIdAndUserIdAndIsDeletedFalse(String ticketId, UUID userId);

    boolean existsByTicketId(String ticketId);

    @Query("SELECT MAX(t.ticketId) FROM SupportTicket t WHERE t.ticketId LIKE :prefix")
    Optional<String> findMaxTicketIdByPrefix(@Param("prefix") String prefix);

    @Query(value = "SELECT nextval('support_ticket_seq')", nativeQuery = true)
    Long getNextTicketSequenceValue();

    // Admin dashboard filtering methods
    List<SupportTicket> findByIsDeletedFalseOrderByCreatedAtDesc();
    
    @Query("SELECT t FROM SupportTicket t WHERE t.isDeleted = false " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:search IS NULL OR " +
           "  LOWER(t.ticketId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(t.user.email) LIKE LOWER(CONCAT('%', :search, '%'))" +
           ") ORDER BY t.createdAt DESC")
    List<SupportTicket> findByFilters(
            @Param("status") com.hirehub.hirehub_backend.enums.TicketStatus status,
            @Param("priority") com.hirehub.hirehub_backend.enums.TicketPriority priority,
            @Param("category") com.hirehub.hirehub_backend.enums.TicketCategory category,
            @Param("search") String search);
}

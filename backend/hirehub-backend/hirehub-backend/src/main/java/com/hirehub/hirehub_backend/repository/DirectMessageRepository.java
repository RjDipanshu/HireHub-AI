package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, UUID> {

    @Query("SELECT m FROM DirectMessage m WHERE m.isDeleted = false AND " +
           "((m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR " +
           "(m.sender.id = :user2Id AND m.recipient.id = :user1Id)) " +
           "ORDER BY m.createdAt ASC")
    List<DirectMessage> findConversationBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);

    @Query("SELECT m FROM DirectMessage m WHERE m.isDeleted = false AND " +
           "(m.sender.id = :userId OR m.recipient.id = :userId) " +
           "ORDER BY m.createdAt DESC")
    List<DirectMessage> findAllByUserOrderByCreatedAtDesc(@Param("userId") UUID userId);

    long countByRecipientIdAndIsReadFalseAndIsDeletedFalse(UUID recipientId);
}

package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndIsReadFalseAndIsDeletedFalse(UUID userId);

    Optional<Notification> findByIdAndIsDeletedFalse(UUID id);
}

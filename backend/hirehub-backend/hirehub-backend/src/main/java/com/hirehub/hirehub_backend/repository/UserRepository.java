package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByIdAndIsDeletedFalse(UUID id);
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    Optional<User> findBySupabaseUserIdAndIsDeletedFalse(UUID supabaseUserId);
    List<User> findAllByIsDeletedFalse();
    List<User> findByRoleNameAndIsDeletedFalse(com.hirehub.hirehub_backend.enums.RoleType roleName);
}

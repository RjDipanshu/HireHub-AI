package com.hirehub.hirehub_backend.repository;

import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleType name);
    boolean existsByName(RoleType name);
}

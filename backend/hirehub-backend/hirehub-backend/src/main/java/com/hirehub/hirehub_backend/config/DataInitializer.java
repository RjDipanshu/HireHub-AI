package com.hirehub.hirehub_backend.config;

import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        log.info("========== Starting Database Initialization ==========");
        seedRoles();
        log.info("========== Database Initialization Completed ==========");
    }

    private void seedRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.existsByName(roleType)) {
                log.info("Role {} already exists.", roleType);
                continue;
            }

            Role role = new Role();
            role.setName(roleType);
            role.setDescription(getRoleDescription(roleType));
            role.setIsDeleted(false);

            roleRepository.save(role);
            log.info("Role {} created successfully.", roleType);
        }
    }

    private String getRoleDescription(RoleType roleType) {
        return switch (roleType) {
            case ADMIN -> "System Administrator with full access";
            case RECRUITER -> "Recruiter responsible for job postings and candidate management";
            case CANDIDATE -> "Candidate looking for job opportunities";
        };
    }
}

package com.hirehub.hirehub_backend.config;

import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.repository.RoleRepository;
import com.hirehub.hirehub_backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;

    @Override
    public void run(String... args) {
        log.info("========== Starting Database Initialization ==========");
        seedRoles();
        seedSkills();
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

    private void seedSkills() {
        Map<String, String> standardSkills = Map.ofEntries(
                Map.entry("Java", "Programming Language"),
                Map.entry("Python", "Programming Language"),
                Map.entry("JavaScript", "Programming Language"),
                Map.entry("TypeScript", "Programming Language"),
                Map.entry("Spring Boot", "Backend Framework"),
                Map.entry("React.js", "Frontend Framework"),
                Map.entry("PostgreSQL", "Database"),
                Map.entry("Docker", "DevOps & Cloud"),
                Map.entry("AWS", "DevOps & Cloud"),
                Map.entry("Git", "Tools")
        );

        for (Map.Entry<String, String> entry : standardSkills.entrySet()) {
            if (!skillRepository.existsByNameIgnoreCaseAndIsDeletedFalse(entry.getKey())) {
                Skill skill = new Skill();
                skill.setName(entry.getKey());
                skill.setCategory(entry.getValue());
                skill.setIsDeleted(false);
                skillRepository.save(skill);
                log.info("Skill {} initialized.", entry.getKey());
            }
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


package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminSupportTicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    private UUID adminSupabaseId;
    private UUID candidateSupabaseId;

    @BeforeEach
    void setUp() {
        adminSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // Admin User
        UserRequestDTO admin = new UserRequestDTO();
        admin.setSupabaseUserId(adminSupabaseId);
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail("admin." + adminSupabaseId.toString().substring(0, 8) + "@hirehub.ai");
        admin.setRole(RoleType.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);
        userService.createUser(admin);

        // Standard Candidate User
        UserRequestDTO candidate = new UserRequestDTO();
        candidate.setSupabaseUserId(candidateSupabaseId);
        candidate.setFirstName("Candidate");
        candidate.setLastName("User");
        candidate.setEmail("candidate." + candidateSupabaseId.toString().substring(0, 8) + "@hirehub.ai");
        candidate.setRole(RoleType.CANDIDATE);
        candidate.setStatus(UserStatus.ACTIVE);
        candidate.setEmailVerified(true);
        userService.createUser(candidate);
    }

    @Test
    @DisplayName("GET /api/v1/admin/support/tickets - Unauthenticated returns 401")
    void testGetTicketsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/admin/support/tickets")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/support/tickets - Non-Admin Role returns 403 Forbidden")
    void testGetTicketsUnauthorizedRole() throws Exception {
        mockMvc.perform(get("/api/v1/admin/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(candidateSupabaseId.toString())
                                .claim("role", "CANDIDATE")
                                .claim("email", "candidate@hirehub.ai"))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CANDIDATE")))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/support/tickets - Admin Role succeeds with 200 OK")
    void testGetTicketsAdminRole() throws Exception {
        mockMvc.perform(get("/api/v1/admin/support/tickets")
                        .with(jwt().jwt(builder -> builder.subject(adminSupabaseId.toString())
                                .claim("role", "ADMIN")
                                .claim("email", "admin@hirehub.ai"))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}

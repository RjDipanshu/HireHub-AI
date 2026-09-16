package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserSyncDTO;
import com.hirehub.hirehub_backend.enums.RoleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/auth/sync - Without JWT should return 401 Unauthorized")
    void testSyncUser_WithoutJwt_ShouldReturn401() throws Exception {
        UserSyncDTO syncDTO = UserSyncDTO.builder()
                .firstName("John")
                .lastName("Doe")
                .role(RoleType.CANDIDATE)
                .build();

        mockMvc.perform(post("/api/v1/auth/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(syncDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/sync - With Valid JWT should sync user and return 200")
    void testSyncUser_WithValidJwt_ShouldReturn200() throws Exception {
        UUID supabaseUserId = UUID.randomUUID();
        String testEmail = "testuser." + supabaseUserId.toString().substring(0, 8) + "@hirehub.com";

        UserSyncDTO syncDTO = UserSyncDTO.builder()
                .firstName("Alice")
                .lastName("Wonderland")
                .phone("1234567890")
                .role(RoleType.CANDIDATE)
                .build();

        mockMvc.perform(post("/api/v1/auth/sync")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail)
                                .claim("email_verified", true)
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(syncDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Wonderland"))
                .andExpect(jsonPath("$.role").value("CANDIDATE"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - With Valid JWT for synced user should return 200")
    void testGetMe_WithValidJwt_ShouldReturn200() throws Exception {
        UUID supabaseUserId = UUID.randomUUID();
        String testEmail = "me." + supabaseUserId.toString().substring(0, 8) + "@hirehub.com";

        // First sync user
        UserSyncDTO syncDTO = UserSyncDTO.builder()
                .firstName("Bob")
                .lastName("Builder")
                .role(RoleType.RECRUITER)
                .build();

        mockMvc.perform(post("/api/v1/auth/sync")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail)
                                .claim("email_verified", true)
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(syncDTO)))
                .andExpect(status().isOk());

        // Then call /me
        mockMvc.perform(get("/api/v1/auth/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail)
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.role").value("RECRUITER"));
    }

    @Test
    @DisplayName("RBAC: GET /api/v1/users - CANDIDATE should return 403 Forbidden")
    void testGetAllUsers_AsCandidate_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC: GET /api/v1/users - ADMIN should return 200 OK")
    void testGetAllUsers_AsAdmin_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

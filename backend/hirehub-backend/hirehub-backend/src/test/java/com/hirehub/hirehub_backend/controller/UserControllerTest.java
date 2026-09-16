package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.UserResponseDTO;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    private UserResponseDTO testUser;
    private UUID testSupabaseId;
    private String testEmail;

    @BeforeEach
    void setUp() {
        testSupabaseId = UUID.randomUUID();
        testEmail = "user." + testSupabaseId.toString().substring(0, 8) + "@hirehub.com";

        UserRequestDTO requestDTO = new UserRequestDTO(
                testSupabaseId,
                "Test",
                "User",
                testEmail,
                "9876543210",
                null,
                RoleType.CANDIDATE,
                UserStatus.ACTIVE,
                true
        );

        testUser = userService.createUser(requestDTO);
    }

    @Test
    @DisplayName("GET /api/v1/users - Unauthenticated should return 401 Unauthorized")
    void testGetAllUsers_Unauthenticated_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/users - CANDIDATE should return 403 Forbidden")
    void testGetAllUsers_AsCandidate_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/users - ADMIN should return 200 OK and list")
    void testGetAllUsers_AsAdmin_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - Authenticated user should return 200")
    void testGetUserById_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users/" + testUser.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.email").value(testEmail));
    }

    @Test
    @DisplayName("GET /api/v1/users/email/{email} - ADMIN should return 200")
    void testGetUserByEmail_AsAdmin_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users/email/" + testEmail)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testEmail));
    }

    @Test
    @DisplayName("GET /api/v1/users/supabase/{supabaseUserId} - Should return 200")
    void testGetUserBySupabaseId_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users/supabase/" + testSupabaseId)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.supabaseUserId").value(testSupabaseId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/users - As ADMIN should create user and return 201")
    void testCreateUser_AsAdmin_ShouldReturn201() throws Exception {
        UUID newSupabaseId = UUID.randomUUID();
        String newEmail = "admincreated." + newSupabaseId.toString().substring(0, 8) + "@hirehub.com";

        UserRequestDTO requestDTO = new UserRequestDTO(
                newSupabaseId,
                "Admin",
                "Created",
                newEmail,
                "1122334455",
                null,
                RoleType.RECRUITER,
                UserStatus.ACTIVE,
                true
        );

        mockMvc.perform(post("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(newEmail))
                .andExpect(jsonPath("$.role").value("RECRUITER"));
    }

    @Test
    @DisplayName("POST /api/v1/users - Validation failure should return 400")
    void testCreateUser_InvalidPayload_ShouldReturn400() throws Exception {
        UserRequestDTO invalidDTO = new UserRequestDTO(); // missing required fields

        mockMvc.perform(post("/api/v1/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - Should update user and return 200")
    void testUpdateUser_ShouldReturn200() throws Exception {
        UserRequestDTO updateDTO = new UserRequestDTO(
                testSupabaseId,
                "UpdatedFirstName",
                "UpdatedLastName",
                testEmail,
                "9999999999",
                null,
                RoleType.CANDIDATE,
                UserStatus.ACTIVE,
                true
        );

        mockMvc.perform(put("/api/v1/users/" + testUser.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("UpdatedFirstName"))
                .andExpect(jsonPath("$.lastName").value("UpdatedLastName"))
                .andExpect(jsonPath("$.phone").value("9999999999"));
    }

    @Test
    @DisplayName("PATCH /api/v1/users/{id}/role - ADMIN should change role and return 200")
    void testUpdateUserRole_AsAdmin_ShouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/users/" + testUser.getId() + "/role")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .param("role", "RECRUITER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("RECRUITER"));
    }

    @Test
    @DisplayName("PATCH /api/v1/users/{id}/role - Non-admin should return 403 Forbidden")
    void testUpdateUserRole_AsNonAdmin_ShouldReturn403() throws Exception {
        mockMvc.perform(patch("/api/v1/users/" + testUser.getId() + "/role")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE")))
                        .param("role", "ADMIN"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/v1/users/{id} - ADMIN should delete and return 204")
    void testDeleteUser_AsAdmin_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/v1/users/" + testUser.getId())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isNoContent());
    }
}

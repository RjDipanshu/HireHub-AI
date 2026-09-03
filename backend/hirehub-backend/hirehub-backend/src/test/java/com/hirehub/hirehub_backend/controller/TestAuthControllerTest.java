package com.hirehub.hirehub_backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TestAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/test/public - Should return 200 without authentication")
    void testPublicEndpoint_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/test/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Public endpoint is accessible without authentication."));
    }

    @Test
    @DisplayName("GET /api/v1/test/protected - Without JWT should return 401 Unauthorized")
    void testProtectedEndpoint_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/test/protected"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/test/protected - With Valid JWT should return 200 and user claims")
    void testProtectedEndpoint_WithValidJwt_ShouldReturn200() throws Exception {
        String testUserId = UUID.randomUUID().toString();
        String testEmail = "candidate@hirehub.com";

        mockMvc.perform(get("/api/v1/test/protected")
                        .with(jwt().jwt(builder -> builder
                                .subject(testUserId)
                                .claim("email", testEmail)
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.supabaseUserId").value(testUserId))
                .andExpect(jsonPath("$.email").value(testEmail));
    }
}

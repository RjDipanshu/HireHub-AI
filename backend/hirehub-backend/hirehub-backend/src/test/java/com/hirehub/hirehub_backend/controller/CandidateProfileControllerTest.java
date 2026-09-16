package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.UserResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.service.UserService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CandidateProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/candidates/me - Without JWT should return 401 Unauthorized")
    void testGetMyProfile_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/candidates/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/skills - Without JWT should return 401 Unauthorized")
    void testGetSkills_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/skills"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/skills - With Valid JWT should return 200 and seeded skills")
    void testGetSkills_WithValidJwt_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/skills")
                        .with(jwt().jwt(builder -> builder.subject(UUID.randomUUID().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST and GET /api/v1/candidates - Create and fetch Candidate Profile")
    void testCreateAndGetCandidateProfile() throws Exception {
        UUID supabaseUserId = UUID.randomUUID();
        String testEmail = "candidate-" + supabaseUserId + "@test.com";

        // Pre-create user to associate candidate profile
        UserRequestDTO userRequest = new UserRequestDTO();
        userRequest.setSupabaseUserId(supabaseUserId);
        userRequest.setFirstName("Alice");
        userRequest.setLastName("Candidate");
        userRequest.setEmail(testEmail);
        userRequest.setRole(RoleType.CANDIDATE);
        userRequest.setStatus(UserStatus.ACTIVE);
        userRequest.setEmailVerified(true);
        userService.createUser(userRequest);

        // Create Candidate Profile
        CandidateProfileRequestDTO profileRequest = new CandidateProfileRequestDTO();
        profileRequest.setHeadline("Full Stack Java & React Developer");
        profileRequest.setBio("Passionate software engineer building scalable web applications.");
        profileRequest.setCurrentLocation("San Francisco, CA");
        profileRequest.setYearsOfExperience(3.5);
        profileRequest.setGithubUrl("https://github.com/alice");
        profileRequest.setLinkedinUrl("https://linkedin.com/in/alice");

        mockMvc.perform(post("/api/v1/candidates")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.headline").value("Full Stack Java & React Developer"))
                .andExpect(jsonPath("$.currentLocation").value("San Francisco, CA"))
                .andExpect(jsonPath("$.yearsOfExperience").value(3.5));

        // Retrieve profile with /me
        mockMvc.perform(get("/api/v1/candidates/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.headline").value("Full Stack Java & React Developer"));

        // Step 3: Update profile using PUT /api/v1/candidates/me
        CandidateProfileRequestDTO updateRequest = new CandidateProfileRequestDTO();
        updateRequest.setHeadline("Staff Software Engineer & AI Architect");
        updateRequest.setCurrentLocation("New York, NY");
        updateRequest.setYearsOfExperience(5.0);
        updateRequest.setPhone("+1-555-0199");
        updateRequest.setGithubUrl("https://github.com/alice-dev");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/candidates/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(supabaseUserId.toString())
                                .claim("email", testEmail)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value("Staff Software Engineer & AI Architect"))
                .andExpect(jsonPath("$.currentLocation").value("New York, NY"))
                .andExpect(jsonPath("$.yearsOfExperience").value(5.0))
                .andExpect(jsonPath("$.phone").value("+1-555-0199"))
                .andExpect(jsonPath("$.githubUrl").value("https://github.com/alice-dev"));
    }
}

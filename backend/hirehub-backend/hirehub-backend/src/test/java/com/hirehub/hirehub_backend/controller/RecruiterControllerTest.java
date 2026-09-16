package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.enums.CompanySize;
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
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class RecruiterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/recruiters/me - Without JWT should return 401")
    void testGetMyProfile_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/recruiters/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/companies - With JWT should return 200 and company list")
    void testGetAllCompanies_WithValidJwt_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/companies")
                        .with(jwt().jwt(b -> b.subject(UUID.randomUUID().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/companies - Create Company and GET by ID")
    void testCreateAndGetCompany() throws Exception {
        CompanyRequestDTO dto = new CompanyRequestDTO();
        dto.setName("TechCorp-" + UUID.randomUUID().toString().substring(0, 8));
        dto.setIndustry("Software");
        dto.setWebsiteUrl("https://techcorp.example.com");
        dto.setLocation("San Francisco, CA");
        dto.setCompanySize(CompanySize.MEDIUM_51_200);
        dto.setDescription("A leading software company.");

        MvcResult result = mockMvc.perform(post("/api/v1/companies")
                        .with(jwt().jwt(b -> b.subject(UUID.randomUUID().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(dto.getName()))
                .andExpect(jsonPath("$.industry").value("Software"))
                .andExpect(jsonPath("$.isVerified").value(false))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        UUID companyId = UUID.fromString(objectMapper.readTree(responseBody).get("id").asText());

        mockMvc.perform(get("/api/v1/companies/" + companyId)
                        .with(jwt().jwt(b -> b.subject(UUID.randomUUID().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(companyId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/recruiters - Create Recruiter Profile linked to Company")
    void testCreateRecruiterProfileAndJoinCompany() throws Exception {
        UUID supabaseUserId = UUID.randomUUID();
        String email = "recruiter-" + supabaseUserId + "@test.com";

        // Pre-create recruiter user
        UserRequestDTO userRequest = new UserRequestDTO();
        userRequest.setSupabaseUserId(supabaseUserId);
        userRequest.setFirstName("Bob");
        userRequest.setLastName("Recruiter");
        userRequest.setEmail(email);
        userRequest.setRole(RoleType.RECRUITER);
        userRequest.setStatus(UserStatus.ACTIVE);
        userRequest.setEmailVerified(true);
        userService.createUser(userRequest);

        // Create company first
        CompanyRequestDTO companyDto = new CompanyRequestDTO();
        companyDto.setName("HireCorp-" + UUID.randomUUID().toString().substring(0, 8));
        companyDto.setIndustry("Recruitment");
        companyDto.setCompanySize(CompanySize.SMALL_11_50);

        MvcResult companyResult = mockMvc.perform(post("/api/v1/companies")
                        .with(jwt().jwt(b -> b.subject(supabaseUserId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(companyDto)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID companyId = UUID.fromString(
                objectMapper.readTree(companyResult.getResponse().getContentAsString()).get("id").asText());

        // Create recruiter profile linked to company
        RecruiterProfileRequestDTO profileDto = new RecruiterProfileRequestDTO();
        profileDto.setDesignation("Senior HR Manager");
        profileDto.setDepartment("Human Resources");
        profileDto.setPhone("+9876543210");
        profileDto.setCompanyId(companyId);

        mockMvc.perform(post("/api/v1/recruiters")
                        .with(jwt().jwt(b -> b.subject(supabaseUserId.toString()).claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.designation").value("Senior HR Manager"))
                .andExpect(jsonPath("$.company.id").value(companyId.toString()))
                .andExpect(jsonPath("$.firstName").value("Bob"));

        // GET /me
        mockMvc.perform(get("/api/v1/recruiters/me")
                        .with(jwt().jwt(b -> b.subject(supabaseUserId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.company.name").value(companyDto.getName()));
    }
}

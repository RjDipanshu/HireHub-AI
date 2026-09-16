package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationRequestDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationStatusUpdateDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.enums.ApplicationStatus;
import com.hirehub.hirehub_backend.enums.CompanySize;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.service.CandidateProfileService;
import com.hirehub.hirehub_backend.service.CompanyService;
import com.hirehub.hirehub_backend.service.JobService;
import com.hirehub.hirehub_backend.service.RecruiterProfileService;
import com.hirehub.hirehub_backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private RecruiterProfileService recruiterProfileService;

    @Autowired
    private CandidateProfileService candidateProfileService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID recruiterSupabaseId;
    private UUID candidateSupabaseId;
    private UUID jobId;

    @BeforeEach
    void setUp() {
        recruiterSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // 1. Create Recruiter & Company & Job
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Sarah");
        recUser.setLastName("Connor");
        recUser.setEmail("sarah-" + recruiterSupabaseId + "@cyberdyne.com");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        CompanyRequestDTO companyDTO = new CompanyRequestDTO();
        companyDTO.setName("Cyberdyne " + UUID.randomUUID().toString().substring(0, 6));
        companyDTO.setIndustry("AI & Robotics");
        companyDTO.setCompanySize(CompanySize.ENTERPRISE_500_PLUS);
        var companyResp = companyService.createCompany(companyDTO);

        RecruiterProfileRequestDTO recProfDTO = new RecruiterProfileRequestDTO();
        recProfDTO.setDesignation("Talent Acquisition Director");
        recProfDTO.setCompanyId(companyResp.getId());
        recruiterProfileService.createProfile(recruiterSupabaseId, recProfDTO);

        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("AI Systems Engineer");
        jobDTO.setDescription("Develop robust real-time neural network pipelines.");
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.ONSITE);
        jobDTO.setStatus(JobStatus.ACTIVE);
        jobDTO.setCompanyId(companyResp.getId());
        var jobResp = jobService.createJob(recruiterSupabaseId, jobDTO);
        jobId = jobResp.getId();

        // 2. Create Candidate
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("Miles");
        candUser.setLastName("Dyson");
        candUser.setEmail("miles-" + candidateSupabaseId + "@example.com");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProfDTO = new CandidateProfileRequestDTO();
        candProfDTO.setHeadline("Senior Research Scientist");
        candidateProfileService.createProfile(candidateSupabaseId, candProfDTO);
    }

    @Test
    @DisplayName("Candidate applies, prevents duplicate, recruiter shortlists, candidate verifies status")
    void testApplicationPipelineFlow() throws Exception {
        // Step 1: Candidate applies for the job
        JobApplicationRequestDTO applyDTO = new JobApplicationRequestDTO();
        applyDTO.setJobId(jobId);
        applyDTO.setCoverLetter("Excited to contribute my research background to this role.");

        MvcResult applyResult = mockMvc.perform(post("/api/v1/applications")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applyDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.jobTitle").value("AI Systems Engineer"))
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.candidateFirstName").value("Miles"))
                .andReturn();

        UUID applicationId = UUID.fromString(
                objectMapper.readTree(applyResult.getResponse().getContentAsString()).get("id").asText());

        // Step 2: Verify duplicate application fails
        mockMvc.perform(post("/api/v1/applications")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applyDTO)))
                .andExpect(status().isBadRequest());

        // Step 3: Recruiter views applicants for the job
        mockMvc.perform(get("/api/v1/applications/job/" + jobId)
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(applicationId.toString()));

        // Step 4: Recruiter updates status to SHORTLISTED
        JobApplicationStatusUpdateDTO statusDTO = new JobApplicationStatusUpdateDTO();
        statusDTO.setStatus(ApplicationStatus.SHORTLISTED);
        statusDTO.setFeedback("Impressive research background. Moving to technical round.");

        mockMvc.perform(patch("/api/v1/applications/" + applicationId + "/status")
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHORTLISTED"))
                .andExpect(jsonPath("$.feedback").value("Impressive research background. Moving to technical round."));

        // Step 5: Candidate checks /me and sees updated status
        mockMvc.perform(get("/api/v1/applications/me")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("SHORTLISTED"));

        // Step 6: Candidate withdraws application
        mockMvc.perform(delete("/api/v1/applications/" + applicationId)
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isNoContent());

        // Step 7: Candidate /me now returns 0 active applications
        mockMvc.perform(get("/api/v1/applications/me")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}

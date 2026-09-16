package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.application.JobApplicationRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.communication.InterviewRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.enums.CompanySize;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.InterviewType;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.service.CandidateProfileService;
import com.hirehub.hirehub_backend.service.CompanyService;
import com.hirehub.hirehub_backend.service.JobApplicationService;
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

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class InterviewControllerTest {

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
    private JobApplicationService jobApplicationService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID recruiterSupabaseId;
    private UUID candidateSupabaseId;
    private UUID applicationId;

    @BeforeEach
    void setUp() {
        recruiterSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // 1. Recruiter setup
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Grace");
        recUser.setLastName("Hopper");
        recUser.setEmail("grace-" + recruiterSupabaseId + "@navy.mil");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        CompanyRequestDTO companyDTO = new CompanyRequestDTO();
        companyDTO.setName("Compilers Unlimited " + UUID.randomUUID().toString().substring(0, 6));
        companyDTO.setIndustry("Software Engineering");
        companyDTO.setCompanySize(CompanySize.MEDIUM_51_200);
        var companyResp = companyService.createCompany(companyDTO);

        RecruiterProfileRequestDTO recProfDTO = new RecruiterProfileRequestDTO();
        recProfDTO.setDesignation("Director of Engineering");
        recProfDTO.setCompanyId(companyResp.getId());
        recruiterProfileService.createProfile(recruiterSupabaseId, recProfDTO);

        // Job
        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("Compiler Architect");
        jobDTO.setDescription("Design modern intermediate representation compilers.");
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.ONSITE);
        jobDTO.setStatus(JobStatus.ACTIVE);
        jobDTO.setCompanyId(companyResp.getId());
        var jobResp = jobService.createJob(recruiterSupabaseId, jobDTO);

        // 2. Candidate setup
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("Dennis");
        candUser.setLastName("Ritchie");
        candUser.setEmail("dennis-" + candidateSupabaseId + "@bell.labs");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProfDTO = new CandidateProfileRequestDTO();
        candProfDTO.setHeadline("Systems Programmer");
        candidateProfileService.createProfile(candidateSupabaseId, candProfDTO);

        // 3. Application
        JobApplicationRequestDTO appDTO = new JobApplicationRequestDTO();
        appDTO.setJobId(jobResp.getId());
        appDTO.setCoverLetter("Interested in systems architecture.");
        var appResp = jobApplicationService.applyForJob(candidateSupabaseId, appDTO);
        applicationId = appResp.getId();
    }

    @Test
    @DisplayName("Recruiter schedules interview, candidate checks list, recruiter completes interview")
    void testInterviewLifecycle() throws Exception {
        // Step 1: Recruiter schedules interview
        InterviewRequestDTO schedDTO = new InterviewRequestDTO();
        schedDTO.setApplicationId(applicationId);
        schedDTO.setScheduledAt(LocalDateTime.now().plusDays(2).withNano(0));
        schedDTO.setDurationMinutes(60);
        schedDTO.setInterviewType(InterviewType.TECHNICAL);
        schedDTO.setMeetingLink("https://meet.google.com/abc-defg-hij");
        schedDTO.setRecruiterNotes("Focus on AST parsing and low-level code generation.");

        MvcResult result = mockMvc.perform(post("/api/v1/interviews")
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.interviewType").value("TECHNICAL"))
                .andExpect(jsonPath("$.candidateName").value("Dennis Ritchie"))
                .andReturn();

        UUID interviewId = UUID.fromString(
                objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText());

        // Step 2: Candidate views their scheduled interviews
        mockMvc.perform(get("/api/v1/interviews/candidate")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(interviewId.toString()));

        // Step 3: Candidate checks notifications
        mockMvc.perform(get("/api/v1/notifications")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Interview Scheduled: Compiler Architect"));

        // Step 4: Recruiter completes interview with feedback
        mockMvc.perform(patch("/api/v1/interviews/" + interviewId + "/complete")
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString())))
                        .param("feedback", "Outstanding candidate. Recommend immediate hire."))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}

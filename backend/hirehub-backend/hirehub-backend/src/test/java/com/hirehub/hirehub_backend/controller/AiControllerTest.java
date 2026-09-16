package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.CoverLetterRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.InterviewPrepRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.JobDescriptionGenerateDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobSkillRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.enums.CompanySize;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.repository.SkillRepository;
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

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AiControllerTest {

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
    private SkillRepository skillRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID recruiterSupabaseId;
    private UUID candidateSupabaseId;
    private UUID jobId;

    @BeforeEach
    void setUp() {
        recruiterSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // 1. Recruiter setup
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Ada");
        recUser.setLastName("Lovelace");
        recUser.setEmail("ada-" + recruiterSupabaseId + "@ai.com");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        CompanyRequestDTO companyDTO = new CompanyRequestDTO();
        companyDTO.setName("DeepMind Systems " + UUID.randomUUID().toString().substring(0, 6));
        companyDTO.setIndustry("Artificial Intelligence");
        companyDTO.setCompanySize(CompanySize.LARGE_201_500);
        var companyResp = companyService.createCompany(companyDTO);

        RecruiterProfileRequestDTO recProfDTO = new RecruiterProfileRequestDTO();
        recProfDTO.setDesignation("AI Talent Lead");
        recProfDTO.setCompanyId(companyResp.getId());
        recruiterProfileService.createProfile(recruiterSupabaseId, recProfDTO);

        // Skill
        Skill javaSkill = skillRepository.findByNameIgnoreCaseAndIsDeletedFalse("Java")
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName("Java");
                    s.setCategory("Programming");
                    return skillRepository.save(s);
                });

        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("Lead Java Architect");
        jobDTO.setDescription("Architect next-generation distributed transaction engines.");
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.REMOTE);
        jobDTO.setStatus(JobStatus.ACTIVE);
        jobDTO.setCompanyId(companyResp.getId());

        JobSkillRequestDTO sReq = new JobSkillRequestDTO();
        sReq.setSkillId(javaSkill.getId());
        sReq.setIsRequired(true);
        jobDTO.setSkills(List.of(sReq));

        var jobResp = jobService.createJob(recruiterSupabaseId, jobDTO);
        jobId = jobResp.getId();

        // 2. Candidate setup
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("Alan");
        candUser.setLastName("Turing");
        candUser.setEmail("alan-" + candidateSupabaseId + "@comp.org");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProfDTO = new CandidateProfileRequestDTO();
        candProfDTO.setHeadline("Distributed Systems & Algorithm Engineer");
        candProfDTO.setYearsOfExperience(6.0);
        candidateProfileService.createProfile(candidateSupabaseId, candProfDTO);
    }

    @Test
    @DisplayName("POST /api/v1/ai/resume-analysis - Compute ATS match score and recommendations")
    void testResumeAnalysis() throws Exception {
        ResumeAnalysisRequestDTO dto = new ResumeAnalysisRequestDTO();
        dto.setJobId(jobId);

        mockMvc.perform(post("/api/v1/ai/resume-analysis")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobTitle").value("Lead Java Architect"))
                .andExpect(jsonPath("$.matchScore").isNumber())
                .andExpect(jsonPath("$.strengths").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/ai/cover-letter - Generate customized professional cover letter")
    void testCoverLetterGeneration() throws Exception {
        CoverLetterRequestDTO dto = new CoverLetterRequestDTO();
        dto.setJobId(jobId);
        dto.setTone("Professional");

        mockMvc.perform(post("/api/v1/ai/cover-letter")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobTitle").value("Lead Java Architect"))
                .andExpect(jsonPath("$.candidateName").value("Alan Turing"))
                .andExpect(jsonPath("$.generatedCoverLetter").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/ai/interview-prep - Generate tailored interview questions")
    void testInterviewPrepGeneration() throws Exception {
        InterviewPrepRequestDTO dto = new InterviewPrepRequestDTO();
        dto.setJobId(jobId);

        mockMvc.perform(post("/api/v1/ai/interview-prep")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions").isArray())
                .andExpect(jsonPath("$.questions[0].question").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/ai/job-description - Generate structured JD from simple prompt")
    void testJobDescriptionGeneration() throws Exception {
        JobDescriptionGenerateDTO dto = new JobDescriptionGenerateDTO();
        dto.setTitle("Senior Cloud Platform Engineer");
        dto.setKeySkills(List.of("Kubernetes", "Golang", "AWS", "Terraform"));

        mockMvc.perform(post("/api/v1/ai/job-description")
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Cloud Platform Engineer"))
                .andExpect(jsonPath("$.responsibilities").isArray())
                .andExpect(jsonPath("$.requirements").isArray());
    }
}

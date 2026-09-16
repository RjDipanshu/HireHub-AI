package com.hirehub.hirehub_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobSkillRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.enums.CompanySize;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.repository.SkillRepository;
import com.hirehub.hirehub_backend.service.CandidateProfileService;
import com.hirehub.hirehub_backend.service.CompanyService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JobControllerTest {

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
    private SkillRepository skillRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID recruiterSupabaseId;
    private UUID candidateSupabaseId;
    private UUID companyId;
    private Skill javaSkill;

    @BeforeEach
    void setUp() {
        recruiterSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // 1. Create Recruiter
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Alice");
        recUser.setLastName("Recruiter");
        recUser.setEmail("recruiter-" + recruiterSupabaseId + "@test.com");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        // 2. Create Company
        CompanyRequestDTO companyDTO = new CompanyRequestDTO();
        companyDTO.setName("Apex Systems " + UUID.randomUUID().toString().substring(0, 6));
        companyDTO.setIndustry("Information Technology");
        companyDTO.setCompanySize(CompanySize.LARGE_201_500);
        var companyResp = companyService.createCompany(companyDTO);
        companyId = companyResp.getId();

        // 3. Create Recruiter Profile
        RecruiterProfileRequestDTO recProfDTO = new RecruiterProfileRequestDTO();
        recProfDTO.setDesignation("Lead Technical Recruiter");
        recProfDTO.setCompanyId(companyId);
        recruiterProfileService.createProfile(recruiterSupabaseId, recProfDTO);

        // 4. Create Candidate
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("John");
        candUser.setLastName("Candidate");
        candUser.setEmail("cand-" + candidateSupabaseId + "@test.com");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProfDTO = new CandidateProfileRequestDTO();
        candProfDTO.setHeadline("Full Stack Java Developer");
        candidateProfileService.createProfile(candidateSupabaseId, candProfDTO);

        // Get a seeded skill
        javaSkill = skillRepository.findByNameIgnoreCaseAndIsDeletedFalse("Java")
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName("Java");
                    s.setCategory("Programming Languages");
                    s.setIsDeleted(false);
                    return skillRepository.save(s);
                });
    }

    @Test
    @DisplayName("Create job, search with filter, save job, and get saved jobs")
    void testJobLifecycleAndBookmarks() throws Exception {
        // Step 1: Create Job
        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("Senior Backend Engineer");
        jobDTO.setDescription("Build scalable distributed systems using Spring Boot.");
        jobDTO.setResponsibilities("Design APIs, optimize databases.");
        jobDTO.setRequirements("5+ years of Java experience.");
        jobDTO.setCompanyId(companyId);
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.REMOTE);
        jobDTO.setExperienceLevel(ExperienceLevel.SENIOR_LEVEL);
        jobDTO.setMinExperienceYears(5);
        jobDTO.setMinSalary(new BigDecimal("120000"));
        jobDTO.setMaxSalary(new BigDecimal("160000"));
        jobDTO.setLocation("San Francisco, CA");
        jobDTO.setStatus(JobStatus.ACTIVE);

        JobSkillRequestDTO skillReq = new JobSkillRequestDTO();
        skillReq.setSkillId(javaSkill.getId());
        skillReq.setIsRequired(true);
        skillReq.setMinExperienceYears(3);
        jobDTO.setSkills(List.of(skillReq));

        MvcResult createResult = mockMvc.perform(post("/api/v1/jobs")
                        .with(jwt().jwt(b -> b.subject(recruiterSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Senior Backend Engineer"))
                .andExpect(jsonPath("$.workMode").value("REMOTE"))
                .andExpect(jsonPath("$.skills[0].skillName").value("Java"))
                .andReturn();

        UUID jobId = UUID.fromString(
                objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText());

        // Step 2: Search jobs with filter
        mockMvc.perform(get("/api/v1/jobs")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .param("keyword", "Backend")
                        .param("workMode", "REMOTE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Senior Backend Engineer"));

        // Step 3: Candidate bookmarks the job
        mockMvc.perform(post("/api/v1/jobs/" + jobId + "/save")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.job.id").value(jobId.toString()));

        // Step 4: Candidate retrieves saved jobs
        mockMvc.perform(get("/api/v1/jobs/saved")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].job.id").value(jobId.toString()));

        // Step 5: Candidate unbookmarks the job
        mockMvc.perform(delete("/api/v1/jobs/" + jobId + "/save")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isNoContent());

        // Step 6: Verify saved list is empty
        mockMvc.perform(get("/api/v1/jobs/saved")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}

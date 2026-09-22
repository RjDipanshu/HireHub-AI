package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillDTO;
import com.hirehub.hirehub_backend.dto.job.JobRequestDTO;
import com.hirehub.hirehub_backend.dto.job.JobSkillRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.enums.CompanySize;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.JobStatus;
import com.hirehub.hirehub_backend.enums.ProficiencyLevel;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.enums.WorkMode;
import com.hirehub.hirehub_backend.repository.SkillRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JobMatchingTest {

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
    private GeminiService geminiService;

    private UUID recruiterSupabaseId;
    private UUID candidateSupabaseId;
    private UUID targetJobId;

    @BeforeEach
    void setUp() {
        recruiterSupabaseId = UUID.randomUUID();
        candidateSupabaseId = UUID.randomUUID();

        // 1. Setup Recruiter & Company
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Linus");
        recUser.setLastName("Torvalds");
        recUser.setEmail("linus-" + recruiterSupabaseId + "@kernel.org");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        CompanyRequestDTO compDTO = new CompanyRequestDTO();
        compDTO.setName("Kernel Labs " + UUID.randomUUID().toString().substring(0, 6));
        compDTO.setIndustry("System Software");
        compDTO.setCompanySize(CompanySize.MEDIUM_51_200);
        var compResp = companyService.createCompany(compDTO);

        RecruiterProfileRequestDTO recProf = new RecruiterProfileRequestDTO();
        recProf.setDesignation("VP Engineering");
        recProf.setCompanyId(compResp.getId());
        recruiterProfileService.createProfile(recruiterSupabaseId, recProf);

        // Skills
        Skill java = getOrCreateSkill("Java");
        Skill spring = getOrCreateSkill("Spring Boot");
        Skill docker = getOrCreateSkill("Docker");
        Skill kafka = getOrCreateSkill("Kafka");

        // Job
        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("Senior Distributed Systems Engineer");
        jobDTO.setDescription("Architect distributed transaction pipelines with Java, Spring Boot, Docker, and Kafka.");
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.REMOTE);
        jobDTO.setStatus(JobStatus.ACTIVE);
        jobDTO.setCompanyId(compResp.getId());

        JobSkillRequestDTO js1 = new JobSkillRequestDTO(); js1.setSkillId(java.getId()); js1.setIsRequired(true);
        JobSkillRequestDTO js2 = new JobSkillRequestDTO(); js2.setSkillId(spring.getId()); js2.setIsRequired(true);
        JobSkillRequestDTO js3 = new JobSkillRequestDTO(); js3.setSkillId(docker.getId()); js3.setIsRequired(true);
        JobSkillRequestDTO js4 = new JobSkillRequestDTO(); js4.setSkillId(kafka.getId()); js4.setIsRequired(true);
        jobDTO.setSkills(List.of(js1, js2, js3, js4));

        var jobResp = jobService.createJob(recruiterSupabaseId, jobDTO);
        targetJobId = jobResp.getId();

        // 2. Setup Candidate with Java & Spring Boot (missing Docker & Kafka)
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("Dennis");
        candUser.setLastName("Ritchie");
        candUser.setEmail("dennis-" + candidateSupabaseId + "@bell-labs.com");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProf = new CandidateProfileRequestDTO();
        candProf.setHeadline("Core Systems & Backend Engineer");
        candProf.setYearsOfExperience(7.0);
        candProf.setBio("Extensive background building high-throughput services and compilers.");
        var profile = candidateProfileService.createProfile(candidateSupabaseId, candProf);

        // Add verified candidate skills
        CandidateSkillDTO cs1 = new CandidateSkillDTO();
        cs1.setSkillId(java.getId());
        cs1.setProficiencyLevel(ProficiencyLevel.EXPERT);
        candidateProfileService.addSkill(profile.getId(), cs1);

        CandidateSkillDTO cs2 = new CandidateSkillDTO();
        cs2.setSkillId(spring.getId());
        cs2.setProficiencyLevel(ProficiencyLevel.ADVANCED);
        candidateProfileService.addSkill(profile.getId(), cs2);
    }

    private Skill getOrCreateSkill(String name) {
        return skillRepository.findByNameIgnoreCaseAndIsDeletedFalse(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory("Technology");
                    return skillRepository.save(s);
                });
    }

    @Test
    @DisplayName("2.0.2 - POST /api/v1/ai/job-match/{jobId} returns structured 2.0 AI match response")
    void testJobMatchEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/ai/job-match/" + targetJobId)
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobId").value(targetJobId.toString()))
                .andExpect(jsonPath("$.jobTitle").value("Senior Distributed Systems Engineer"))
                .andExpect(jsonPath("$.overallMatchScore").isNumber())
                .andExpect(jsonPath("$.matchLevel").isNotEmpty())
                .andExpect(jsonPath("$.categoryScores.skills").isNumber())
                .andExpect(jsonPath("$.categoryScores.experience").isNumber())
                .andExpect(jsonPath("$.categoryScores.education").isNumber())
                .andExpect(jsonPath("$.matchingSkills").isArray())
                .andExpect(jsonPath("$.missingSkills").isArray())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.gaps").isArray())
                .andExpect(jsonPath("$.recommendation").isNotEmpty())
                .andExpect(jsonPath("$.explanation").isNotEmpty());
    }

    @Test
    @DisplayName("2.0.2 - POST /api/v1/ai/job-match/{invalidId} returns 404 Not Found")
    void testJobMatchNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(post("/api/v1/ai/job-match/" + nonExistentId)
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("2.0.4 - Heuristic Fallback calculates accurate matching and missing skills without hallucination")
    void testJobMatchHeuristicAntiHallucination() {
        List<String> candSkills = List.of("Java", "Spring Boot", "React", "PostgreSQL");
        List<String> jobSkills = List.of("Java", "Spring Boot", "Docker", "Kafka", "AWS");

        JobMatchResponseDTO result = geminiService.matchCandidateToJobHeuristic(
                "Dennis Ritchie - 7 years experience building Java & Spring Boot backend services.",
                "Target Job: Senior Distributed Engineer requiring Java, Spring Boot, Docker, Kafka, AWS.",
                candSkills,
                jobSkills
        );

        assertThat(result.getOverallMatchScore()).isBetween(40, 95);
        assertThat(result.getMatchingSkills()).contains("Java", "Spring Boot");
        assertThat(result.getMissingSkills()).contains("Docker", "Kafka", "AWS");
        assertThat(result.getCategoryScores().get("skills")).isNotNull();
        assertThat(result.getGaps()).isNotEmpty();
        // Critical: Missing skills are reported, not hallucinated
        assertThat(result.getMatchingSkills()).doesNotContain("Docker", "Kafka", "AWS");
    }
}

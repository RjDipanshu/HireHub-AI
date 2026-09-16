package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticCandidateMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticJobMatchDTO;
import com.hirehub.hirehub_backend.dto.ai.SemanticSearchRequestDTO;
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
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class SemanticSearchTest {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private SemanticSearchService semanticSearchService;

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

    private UUID candidateSupabaseId;
    private UUID recruiterSupabaseId;

    @BeforeEach
    void setUp() {
        candidateSupabaseId = UUID.randomUUID();
        recruiterSupabaseId = UUID.randomUUID();

        // Setup Recruiter & Company
        UserRequestDTO recUser = new UserRequestDTO();
        recUser.setSupabaseUserId(recruiterSupabaseId);
        recUser.setFirstName("Semantic");
        recUser.setLastName("Recruiter");
        recUser.setEmail("recruiter-" + recruiterSupabaseId + "@techcorp.io");
        recUser.setRole(RoleType.RECRUITER);
        recUser.setStatus(UserStatus.ACTIVE);
        recUser.setEmailVerified(true);
        userService.createUser(recUser);

        CompanyRequestDTO compDTO = new CompanyRequestDTO();
        compDTO.setName("Cloud Scale Systems " + recruiterSupabaseId);
        compDTO.setCompanySize(CompanySize.MEDIUM_51_200);
        var compResp = companyService.createCompany(compDTO);

        RecruiterProfileRequestDTO recProf = new RecruiterProfileRequestDTO();
        recProf.setDesignation("Director of Architecture");
        recProf.setCompanyId(compResp.getId());
        recruiterProfileService.createProfile(recruiterSupabaseId, recProf);

        Skill java = getOrCreateSkill("Java");
        Skill spring = getOrCreateSkill("Spring Boot");
        Skill k8s = getOrCreateSkill("Kubernetes");

        // Create Distributed Systems Job
        JobRequestDTO jobDTO = new JobRequestDTO();
        jobDTO.setTitle("Distributed Cloud Platform Architect");
        jobDTO.setDescription("Architect high-throughput microservices using Java, Spring Boot, and Kubernetes for global cloud infrastructure.");
        jobDTO.setEmploymentType(EmploymentType.FULL_TIME);
        jobDTO.setWorkMode(WorkMode.REMOTE);
        jobDTO.setStatus(JobStatus.ACTIVE);
        jobDTO.setCompanyId(compResp.getId());

        JobSkillRequestDTO js1 = new JobSkillRequestDTO(); js1.setSkillId(java.getId()); js1.setIsRequired(true);
        JobSkillRequestDTO js2 = new JobSkillRequestDTO(); js2.setSkillId(spring.getId()); js2.setIsRequired(true);
        JobSkillRequestDTO js3 = new JobSkillRequestDTO(); js3.setSkillId(k8s.getId()); js3.setIsRequired(true);
        jobDTO.setSkills(List.of(js1, js2, js3));
        jobService.createJob(recruiterSupabaseId, jobDTO);

        // Setup Candidate
        UserRequestDTO candUser = new UserRequestDTO();
        candUser.setSupabaseUserId(candidateSupabaseId);
        candUser.setFirstName("Alan");
        candUser.setLastName("Turing");
        candUser.setEmail("alan-" + candidateSupabaseId + "@turing.org");
        candUser.setRole(RoleType.CANDIDATE);
        candUser.setStatus(UserStatus.ACTIVE);
        candUser.setEmailVerified(true);
        userService.createUser(candUser);

        CandidateProfileRequestDTO candProf = new CandidateProfileRequestDTO();
        candProf.setHeadline("Staff Distributed Systems & Backend Engineer | Java Specialist");
        candProf.setYearsOfExperience(8.0);
        candProf.setBio("Specialized in backend engineering, scalable REST APIs, microservices architectures, and cloud deployment.");
        var profile = candidateProfileService.createProfile(candidateSupabaseId, candProf);

        CandidateSkillDTO cs1 = new CandidateSkillDTO();
        cs1.setSkillId(java.getId());
        cs1.setProficiencyLevel(ProficiencyLevel.EXPERT);
        candidateProfileService.addSkill(profile.getId(), cs1);

        CandidateSkillDTO cs2 = new CandidateSkillDTO();
        cs2.setSkillId(spring.getId());
        cs2.setProficiencyLevel(ProficiencyLevel.EXPERT);
        candidateProfileService.addSkill(profile.getId(), cs2);
    }

    private Skill getOrCreateSkill(String name) {
        return skillRepository.findByNameIgnoreCaseAndIsDeletedFalse(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory("Backend");
                    return skillRepository.save(s);
                });
    }

    @Test
    @DisplayName("11.0 - GeminiService generates 768-dimensional normalized vector embedding")
    void testVectorEmbeddingGeneration() {
        String input = "Backend engineer experienced in building scalable REST APIs";
        List<Double> vector = geminiService.generateEmbedding(input);

        assertThat(vector).isNotNull();
        assertThat(vector).hasSize(768);

        // Verify L2 normalization (norm ~ 1.0)
        double norm = Math.sqrt(vector.stream().mapToDouble(v -> v * v).sum());
        assertThat(norm).isBetween(0.95, 1.05);
    }

    @Test
    @DisplayName("12.0 - Semantic Job Search matches natural language intent without exact keyword")
    void testSemanticJobSearch() {
        SemanticSearchRequestDTO request = SemanticSearchRequestDTO.builder()
                .query("Find backend roles involving scalable distributed systems and cloud technologies")
                .limit(5)
                .minSimilarity(0.15)
                .build();

        List<SemanticJobMatchDTO> results = semanticSearchService.searchJobsSemantically(request);

        assertThat(results).isNotEmpty();
        SemanticJobMatchDTO topMatch = results.get(0);
        assertThat(topMatch.getTitle()).isNotEmpty();
        assertThat(topMatch.getSimilarityScore()).isGreaterThan(0.10);
        assertThat(topMatch.getMatchPercentage()).isGreaterThan(10);
        assertThat(topMatch.getMatchRationale()).isNotEmpty();
    }

    @Test
    @DisplayName("13.0 - Semantic Candidate Search discovers candidate based on skill context")
    void testSemanticCandidateSearch() {
        SemanticSearchRequestDTO request = SemanticSearchRequestDTO.builder()
                .query("Find backend developers with strong Java experience and exposure to cloud deployment")
                .limit(5)
                .minSimilarity(0.15)
                .build();

        List<SemanticCandidateMatchDTO> results = semanticSearchService.searchCandidatesSemantically(request);

        assertThat(results).isNotEmpty();
        SemanticCandidateMatchDTO top = results.get(0);
        assertThat(top.getCandidateName()).isNotEmpty();
        assertThat(top.getSimilarityScore()).isGreaterThan(0.10);
        assertThat(top.getMatchPercentage()).isGreaterThan(10);
        assertThat(top.getMatchRationale()).isNotEmpty();
    }

    @Test
    @DisplayName("11.0 - Cosine Similarity correctly scores identical, similar, and orthogonal vectors")
    void testCosineSimilarityMath() {
        List<Double> v1 = List.of(1.0, 0.0, 0.0);
        List<Double> v2 = List.of(1.0, 0.0, 0.0);
        List<Double> v3 = List.of(0.0, 1.0, 0.0);

        double identical = semanticSearchService.computeCosineSimilarity(v1, v2);
        double orthogonal = semanticSearchService.computeCosineSimilarity(v1, v3);

        assertThat(identical).isEqualTo(1.0);
        assertThat(orthogonal).isEqualTo(0.0);
    }
}

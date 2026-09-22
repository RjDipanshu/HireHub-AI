package com.hirehub.hirehub_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ResumeAnalysisTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PdfTextExtractorService pdfTextExtractorService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserService userService;

    @Autowired
    private CandidateProfileService candidateProfileService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID candidateSupabaseId;

    @BeforeEach
    void setUp() {
        candidateSupabaseId = UUID.randomUUID();

        UserRequestDTO userDTO = new UserRequestDTO();
        userDTO.setSupabaseUserId(candidateSupabaseId);
        userDTO.setFirstName("Grace");
        userDTO.setLastName("Hopper");
        userDTO.setEmail("grace-" + candidateSupabaseId + "@navy.mil");
        userDTO.setRole(RoleType.CANDIDATE);
        userDTO.setStatus(UserStatus.ACTIVE);
        userDTO.setEmailVerified(true);
        userService.createUser(userDTO);

        CandidateProfileRequestDTO profileDTO = new CandidateProfileRequestDTO();
        profileDTO.setHeadline("Compiler Engineer & Systems Architect");
        profileDTO.setYearsOfExperience(8.0);
        candidateProfileService.createProfile(candidateSupabaseId, profileDTO);
    }

    private byte[] createSamplePdfBytes(String content) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                stream.newLineAtOffset(50, 700);
                stream.showText(content);
                stream.endText();
            }
            doc.save(baos);
        }
        return baos.toByteArray();
    }

    @Test
    @DisplayName("1.0.3 - Extract plain text from PDF using Apache PDFBox")
    void testPdfTextExtraction() throws Exception {
        byte[] pdfBytes = createSamplePdfBytes("Grace Hopper - Senior Java and Systems Engineer. Skills: Java, Spring Boot, SQL, Git.");
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytes);

        String extracted = pdfTextExtractorService.extractTextFromMultipart(file);
        assertThat(extracted).contains("Grace Hopper");
        assertThat(extracted).contains("Senior Java and Systems Engineer");
        assertThat(extracted).contains("Spring Boot");
    }

    @Test
    @DisplayName("1.0.3 - Reject invalid non-PDF file formats")
    void testInvalidPdfFileRejection() {
        byte[] fakeBytes = "This is not a PDF file".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", fakeBytes);

        assertThrows(IllegalArgumentException.class, () -> {
            pdfTextExtractorService.extractTextFromMultipart(file);
        });
    }

    @Test
    @DisplayName("1.0.5 - Structured AI output validation from heuristic engine fallback")
    void testStructuredOutputSchema() {
        String sampleResume = """
                Grace Hopper
                Senior Backend Engineer
                Skills: Java, Spring Boot, PostgreSQL, Docker, Git, Leadership, Problem Solving
                Experience: 8 years building distributed compilers and transaction systems. Reduced latency by 40%.
                Education: Ph.D. in Mathematics, Yale University
                """;

        ResumeAnalysisResponseDTO result = geminiService.analyzeResumeHeuristic(sampleResume, "Principal Backend Architect");

        assertThat(result.getOverallScore()).isBetween(0, 100);
        assertThat(result.getSummary()).isNotEmpty();
        assertThat(result.getTechnicalSkills()).contains("Java", "Spring Boot");
        assertThat(result.getSoftSkills()).isNotEmpty();
        assertThat(result.getStrengths()).isNotEmpty();
        assertThat(result.getWeaknesses()).isNotEmpty();
        assertThat(result.getFormattingIssues()).isNotEmpty();
        assertThat(result.getSuggestions()).isNotEmpty();
        assertThat(result.getModelUsed()).isEqualTo("hirehub-heuristic-v1.0");
    }

    @Test
    @DisplayName("1.0.2 & 1.0.6 - POST /api/v1/ai/resume-analysis with text and persistence")
    void testResumeAnalysisEndpoint() throws Exception {
        ResumeAnalysisRequestDTO dto = new ResumeAnalysisRequestDTO();
        dto.setResumeText("Grace Hopper. Senior Systems Architect with Java, SQL, and Microservices experience.");
        dto.setTargetRole("Principal Cloud Architect");

        mockMvc.perform(post("/api/v1/ai/resume-analysis")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallScore").isNumber())
                .andExpect(jsonPath("$.summary").isNotEmpty())
                .andExpect(jsonPath("$.technicalSkills").isArray())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.suggestions").isArray());
    }

    @Test
    @DisplayName("1.0.3, 1.0.6 & 1.0.8 - POST /api/v1/ai/resume-analysis/upload with multipart PDF")
    void testResumeAnalysisMultipartUpload() throws Exception {
        byte[] pdfBytes = createSamplePdfBytes("Grace Hopper. Lead Engineer. Skills: Java, Spring Boot, React, SQL. Achievements: Scaled throughput 50%.");
        MockMultipartFile file = new MockMultipartFile("file", "hopper_resume.pdf", "application/pdf", pdfBytes);

        mockMvc.perform(multipart("/api/v1/ai/resume-analysis/upload")
                        .file(file)
                        .param("targetRole", "Staff Software Engineer")
                        .with(jwt().jwt(b -> b.subject(candidateSupabaseId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumeId").isNotEmpty())
                .andExpect(jsonPath("$.overallScore").isNumber())
                .andExpect(jsonPath("$.technicalSkills").isArray())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.suggestions").isArray());
    }
}

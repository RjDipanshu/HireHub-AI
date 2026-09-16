package com.hirehub.hirehub_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.entity.ResumeAnalysis;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.ResumeAnalysisRepository;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeAnalysisService {

    private final GeminiService geminiService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 1.0.2 & 1.0.6: Analyzes candidate resume text/ID/job and persists structured analysis in DB.
     */
    @Transactional
    public ResumeAnalysisResponseDTO analyzeAndPersistResume(UUID supabaseUserId, ResumeAnalysisRequestDTO dto) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Resume resume = null;
        String resumeText = dto.getResumeText();

        // 1. Resolve Resume entity if resumeId is provided
        if (dto.getResumeId() != null) {
            resume = resumeRepository.findByIdAndIsDeletedFalse(dto.getResumeId())
                    .orElseThrow(() -> new RuntimeException("Resume not found with ID: " + dto.getResumeId()));

            // Authorization: candidate ownership check
            if (!resume.getCandidateProfile().getId().equals(candidate.getId())) {
                throw new RuntimeException("Access denied: You do not have permission to access this resume.");
            }

            if (resumeText == null || resumeText.isBlank()) {
                if (resume.getParsedText() != null && !resume.getParsedText().isBlank()) {
                    resumeText = resume.getParsedText();
                } else if (resume.getFileUrl() != null && resume.getFileUrl().toLowerCase().endsWith(".pdf")) {
                    try {
                        resumeText = pdfTextExtractorService.extractTextFromUrl(resume.getFileUrl());
                        resume.setParsedText(resumeText);
                        resumeRepository.save(resume);
                    } catch (Exception e) {
                        log.warn("Could not extract text from resume URL: {}", e.getMessage());
                    }
                }
            }
        }

        // 2. Fallback: If resumeText is still empty, synthesize from candidate profile
        if (resumeText == null || resumeText.isBlank()) {
            resumeText = buildProfileSummaryText(candidate);
        }

        // 3. Resolve Target Role
        String targetRole = dto.getTargetRole();
        Job job = null;
        if (dto.getJobId() != null) {
            job = jobRepository.findByIdAndIsDeletedFalse(dto.getJobId()).orElse(null);
            if (job != null) {
                targetRole = job.getTitle() + " at " + (job.getCompany() != null ? job.getCompany().getName() : "Enterprise");
            }
        }
        if (targetRole == null || targetRole.isBlank()) {
            targetRole = candidate.getHeadline() != null && !candidate.getHeadline().isBlank()
                    ? candidate.getHeadline()
                    : "Software Engineer";
        }

        // 4. Run Gemini Structured Analysis (or resilient heuristic engine)
        ResumeAnalysisResponseDTO responseDTO = geminiService.analyzeResumeStructured(resumeText, targetRole);

        if (job != null) {
            responseDTO.setJobId(job.getId());
            responseDTO.setJobTitle(job.getTitle());
        }
        if (resume != null) {
            responseDTO.setResumeId(resume.getId());
        }

        // 5. Persist to Database
        persistAnalysisRecord(candidate, resume, responseDTO);

        // 6. Update ATS score on Resume if linked
        if (resume != null) {
            resume.setAtsScore((double) responseDTO.getMatchScore());
            resumeRepository.save(resume);
        }

        return responseDTO;
    }

    /**
     * 1.0.3 & 1.0.6: Uploads a PDF resume, extracts text via Apache PDFBox, runs structured AI, and persists.
     */
    @Transactional
    public ResumeAnalysisResponseDTO analyzeUploadedPdfAndPersist(
            UUID supabaseUserId,
            MultipartFile file,
            UUID jobId,
            String targetRole
    ) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        // 1. Extract text using Apache PDFBox
        String extractedText = pdfTextExtractorService.extractTextFromMultipart(file);

        // 2. Create Resume entity
        Resume resume = new Resume();
        resume.setCandidateProfile(candidate);
        resume.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_resume.pdf");
        resume.setFileType(file.getContentType() != null ? file.getContentType() : "application/pdf");
        resume.setFileSize(file.getSize());
        resume.setFileUrl("/resumes/" + resume.getFileName());
        resume.setParsedText(extractedText);
        resume.setIsPrimary(false);
        resume = resumeRepository.save(resume);

        // 3. Delegate to structured analysis
        ResumeAnalysisRequestDTO dto = new ResumeAnalysisRequestDTO();
        dto.setResumeId(resume.getId());
        dto.setResumeText(extractedText);
        dto.setJobId(jobId);
        dto.setTargetRole(targetRole);

        return analyzeAndPersistResume(supabaseUserId, dto);
    }

    /**
     * Retrieves the latest persisted analysis for a candidate's resume.
     */
    @Transactional(readOnly = true)
    public ResumeAnalysisResponseDTO getLatestAnalysisByResume(UUID supabaseUserId, UUID resumeId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Resume resume = resumeRepository.findByIdAndIsDeletedFalse(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with ID: " + resumeId));

        if (!resume.getCandidateProfile().getId().equals(candidate.getId())) {
            throw new RuntimeException("Access denied: You do not have permission to access this resume.");
        }

        ResumeAnalysis analysis = resumeAnalysisRepository.findTopByResumeIdOrderByCreatedAtDesc(resumeId)
                .orElseThrow(() -> new RuntimeException("No analysis found for resume: " + resumeId));

        return convertEntityToDTO(analysis, resume);
    }

    /**
     * Persists structured analysis entity into resume_analyses table.
     */
    private void persistAnalysisRecord(CandidateProfile candidate, Resume resume, ResumeAnalysisResponseDTO dto) {
        try {
            ResumeAnalysis entity = new ResumeAnalysis();
            entity.setCandidateProfile(candidate);
            entity.setResume(resume);
            entity.setOverallScore(dto.getOverallScore() != null ? dto.getOverallScore() : dto.getMatchScore());
            entity.setSummary(dto.getSummary());
            entity.setTechnicalSkills(objectMapper.writeValueAsString(dto.getTechnicalSkills()));
            entity.setSoftSkills(objectMapper.writeValueAsString(dto.getSoftSkills()));
            entity.setEducationJson(objectMapper.writeValueAsString(dto.getEducation()));
            entity.setExperienceJson(objectMapper.writeValueAsString(dto.getExperience()));
            entity.setProjectsJson(objectMapper.writeValueAsString(dto.getProjects()));
            entity.setCertificationsJson(objectMapper.writeValueAsString(dto.getCertifications()));
            entity.setKeywordsJson(objectMapper.writeValueAsString(dto.getKeywords()));
            entity.setStrengthsJson(objectMapper.writeValueAsString(dto.getStrengths()));
            entity.setWeaknessesJson(objectMapper.writeValueAsString(dto.getWeaknesses()));
            entity.setMissingSkillsJson(objectMapper.writeValueAsString(dto.getMissingSkills()));
            entity.setFormattingIssuesJson(objectMapper.writeValueAsString(dto.getFormattingIssues()));
            entity.setAtsCompatibilityIssuesJson(objectMapper.writeValueAsString(dto.getAtsCompatibilityIssues()));
            entity.setSuggestionsJson(objectMapper.writeValueAsString(dto.getSuggestions()));
            entity.setModelUsed(dto.getModelUsed() != null ? dto.getModelUsed() : "gemini-1.5-flash");

            resumeAnalysisRepository.save(entity);
        } catch (Exception e) {
            log.error("Failed to persist ResumeAnalysis to database: {}", e.getMessage(), e);
        }
    }

    private ResumeAnalysisResponseDTO convertEntityToDTO(ResumeAnalysis entity, Resume resume) {
        List<String> techSkills = parseJsonList(entity.getTechnicalSkills());
        List<String> softSkills = parseJsonList(entity.getSoftSkills());
        List<String> allDetected = new ArrayList<>(techSkills);
        allDetected.addAll(softSkills);

        List<String> education = parseJsonList(entity.getEducationJson());
        List<String> experience = parseJsonList(entity.getExperienceJson());
        List<String> projects = parseJsonList(entity.getProjectsJson());
        List<String> certifications = parseJsonList(entity.getCertificationsJson());
        List<String> keywords = parseJsonList(entity.getKeywordsJson());
        List<String> strengths = parseJsonList(entity.getStrengthsJson());
        List<String> weaknesses = parseJsonList(entity.getWeaknessesJson());
        List<String> missingSkills = parseJsonList(entity.getMissingSkillsJson());
        List<String> formattingIssues = parseJsonList(entity.getFormattingIssuesJson());
        List<String> atsCompatibilityIssues = parseJsonList(entity.getAtsCompatibilityIssuesJson());
        List<String> suggestions = parseJsonList(entity.getSuggestionsJson());

        int score = entity.getOverallScore() != null ? entity.getOverallScore() : 75;
        String matchLevel = score >= 80 ? "High" : score >= 65 ? "Medium" : "Low";

        return ResumeAnalysisResponseDTO.builder()
                .resumeId(resume != null ? resume.getId() : null)
                .matchScore(score)
                .overallScore(score)
                .matchLevel(matchLevel)
                .summary(entity.getSummary())
                .technicalSkills(techSkills)
                .softSkills(softSkills)
                .detectedSkills(allDetected)
                .matchingSkills(techSkills)
                .missingSkills(missingSkills)
                .education(education)
                .experience(experience)
                .projects(projects)
                .certifications(certifications)
                .keywords(keywords)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .formattingIssues(formattingIssues)
                .atsCompatibilityIssues(atsCompatibilityIssues)
                .suggestions(suggestions)
                .recommendations(suggestions)
                .skillsMatchScore(Math.min(96, score + 4))
                .experienceMatchScore(Math.min(94, Math.max(50, score - 3)))
                .educationMatchScore(92)
                .keywordsScore(Math.min(95, Math.max(55, score)))
                .formattingScore(90)
                .skillRecommendations(missingSkills)
                .keywordRecommendations(keywords)
                .experienceImprovements(suggestions)
                .missingSections(weaknesses)
                .modelUsed(entity.getModelUsed())
                .analyzedAt(entity.getCreatedAt())
                .build();
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String buildProfileSummaryText(CandidateProfile candidate) {
        StringBuilder sb = new StringBuilder();
        if (candidate.getUser() != null) {
            sb.append("Name: ").append(candidate.getUser().getFirstName()).append(" ").append(candidate.getUser().getLastName()).append("\n");
        }
        if (candidate.getHeadline() != null) {
            sb.append("Headline: ").append(candidate.getHeadline()).append("\n");
        }
        if (candidate.getBio() != null) {
            sb.append("Summary: ").append(candidate.getBio()).append("\n");
        }
        if (candidate.getCandidateSkills() != null && !candidate.getCandidateSkills().isEmpty()) {
            sb.append("Skills: ").append(candidate.getCandidateSkills().stream()
                    .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                    .map(cs -> cs.getSkill().getName())
                    .collect(Collectors.joining(", "))).append("\n");
        }
        if (candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
            sb.append("Experience:\n");
            candidate.getExperiences().stream()
                    .filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
                    .forEach(e -> sb.append("- ").append(e.getJobTitle()).append(" at ").append(e.getCompanyName())
                            .append(": ").append(e.getDescription() != null ? e.getDescription() : "").append("\n"));
        }
        if (candidate.getEducations() != null && !candidate.getEducations().isEmpty()) {
            sb.append("Education:\n");
            candidate.getEducations().stream()
                    .filter(ed -> !Boolean.TRUE.equals(ed.getIsDeleted()))
                    .forEach(ed -> sb.append("- ").append(ed.getDegree()).append(" in ").append(ed.getFieldOfStudy())
                            .append(" from ").append(ed.getInstitution()).append("\n"));
        }
        return sb.toString();
    }
}

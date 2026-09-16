package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.CandidateSkill;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.JobSkill;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobMatchingService {

    private final GeminiService geminiService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;

    /**
     * 2.0 AI Job Match: Matches an authenticated candidate against a target job.
     */
    public JobMatchResponseDTO matchJob(UUID supabaseUserId, UUID jobId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Candidate Skills
        List<String> candidateSkills = candidate.getCandidateSkills() != null
                ? candidate.getCandidateSkills().stream()
                .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                .map(cs -> cs.getSkill().getName())
                .collect(Collectors.toList())
                : new ArrayList<>();

        // Target Job Required Skills
        List<String> jobSkills = job.getSkills() != null
                ? job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName())
                .collect(Collectors.toList())
                : new ArrayList<>();

        // Fetch candidate primary/latest resume text if available
        String resumeText = "";
        List<Resume> resumes = resumeRepository.findByCandidateProfileIdAndIsDeletedFalseOrderByCreatedAtDesc(candidate.getId());
        if (resumes != null && !resumes.isEmpty()) {
            Resume primaryResume = resumes.stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsPrimary()))
                    .findFirst()
                    .orElse(resumes.get(0));
            if (primaryResume.getParsedText() != null) {
                resumeText = primaryResume.getParsedText();
            }
        }

        // Build Candidate Context string
        String candidateContext = buildCandidateContext(candidate, candidateSkills, resumeText);

        // Build Job Context string
        String jobContext = buildJobContext(job, jobSkills);

        // Call Gemini Service
        JobMatchResponseDTO matchResponse = geminiService.matchCandidateToJobStructured(
                candidateContext,
                jobContext,
                candidateSkills,
                jobSkills
        );

        matchResponse.setJobId(job.getId());
        matchResponse.setJobTitle(job.getTitle());
        matchResponse.setCompanyName(job.getCompany() != null ? job.getCompany().getName() : "Hiring Company");

        return matchResponse;
    }

    private String buildCandidateContext(CandidateProfile candidate, List<String> skills, String resumeText) {
        StringBuilder sb = new StringBuilder();
        if (candidate.getUser() != null) {
            sb.append("Candidate: ").append(candidate.getUser().getFirstName()).append(" ")
                    .append(candidate.getUser().getLastName()).append("\n");
        }
        if (candidate.getHeadline() != null) {
            sb.append("Headline: ").append(candidate.getHeadline()).append("\n");
        }
        if (candidate.getYearsOfExperience() != null) {
            sb.append("Years of Experience: ").append(candidate.getYearsOfExperience()).append("\n");
        }
        if (candidate.getBio() != null) {
            sb.append("Summary: ").append(candidate.getBio()).append("\n");
        }
        if (!skills.isEmpty()) {
            sb.append("Documented Skills: ").append(String.join(", ", skills)).append("\n");
        }
        if (candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
            sb.append("Work Experiences:\n");
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
        if (resumeText != null && !resumeText.isBlank()) {
            sb.append("\nResume Text Excerpt:\n")
                    .append(resumeText.length() > 3000 ? resumeText.substring(0, 3000) + "..." : resumeText)
                    .append("\n");
        }
        return sb.toString();
    }

    private String buildJobContext(Job job, List<String> requiredSkills) {
        StringBuilder sb = new StringBuilder();
        sb.append("Target Role: ").append(job.getTitle()).append("\n");
        if (job.getCompany() != null) {
            sb.append("Company: ").append(job.getCompany().getName()).append("\n");
        }
        if (job.getEmploymentType() != null) {
            sb.append("Employment Type: ").append(job.getEmploymentType()).append("\n");
        }
        if (job.getWorkMode() != null) {
            sb.append("Work Mode: ").append(job.getWorkMode()).append("\n");
        }
        if (job.getExperienceLevel() != null) {
            sb.append("Experience Level: ").append(job.getExperienceLevel()).append("\n");
        }
        if (!requiredSkills.isEmpty()) {
            sb.append("Required Skills: ").append(String.join(", ", requiredSkills)).append("\n");
        }
        if (job.getDescription() != null && !job.getDescription().isBlank()) {
            sb.append("Description:\n").append(job.getDescription()).append("\n");
        }
        if (job.getResponsibilities() != null && !job.getResponsibilities().isBlank()) {
            sb.append("Key Responsibilities:\n").append(job.getResponsibilities()).append("\n");
        }
        if (job.getRequirements() != null && !job.getRequirements().isBlank()) {
            sb.append("Requirements:\n").append(job.getRequirements()).append("\n");
        }
        return sb.toString();
    }
}

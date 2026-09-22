package com.hirehub.hirehub_backend.jobmatching.service;

import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateContextService {

    private final ResumeRepository resumeRepository;

    public String buildCandidateContext(CandidateProfile candidate, String customResumeText) {
        StringBuilder sb = new StringBuilder();
        if (candidate.getUser() != null) {
            sb.append("Candidate Name: ").append(candidate.getUser().getFirstName())
                    .append(" ").append(candidate.getUser().getLastName()).append("\n");
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

        List<String> skills = extractCandidateSkills(candidate);
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

        String resumeText = customResumeText;
        if ((resumeText == null || resumeText.isBlank()) && candidate.getId() != null) {
            List<Resume> resumes = resumeRepository.findByCandidateProfileIdAndIsDeletedFalseOrderByCreatedAtDesc(candidate.getId());
            if (resumes != null && !resumes.isEmpty()) {
                Resume primary = resumes.stream()
                        .filter(r -> Boolean.TRUE.equals(r.getIsPrimary()))
                        .findFirst()
                        .orElse(resumes.get(0));
                resumeText = primary.getParsedText();
            }
        }

        if (resumeText != null && !resumeText.isBlank()) {
            sb.append("\nResume Text Excerpt:\n")
                    .append(resumeText.length() > 2500 ? resumeText.substring(0, 2500) + "..." : resumeText)
                    .append("\n");
        }

        return sb.toString();
    }

    public List<String> extractCandidateSkills(CandidateProfile candidate) {
        if (candidate.getCandidateSkills() == null) return List.of();
        return candidate.getCandidateSkills().stream()
                .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                .map(cs -> cs.getSkill().getName())
                .collect(Collectors.toList());
    }
}

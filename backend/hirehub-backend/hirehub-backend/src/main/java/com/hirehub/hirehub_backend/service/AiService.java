package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.ai.ApplicantRankingResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.CoverLetterRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.CoverLetterResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.InterviewPrepRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.InterviewPrepResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.JobDescriptionGenerateDTO;
import com.hirehub.hirehub_backend.dto.ai.JobDescriptionResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisRequestDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.CandidateSkill;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.JobApplication;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiService {

    private final GeminiService geminiService;
    private final ResumeAnalysisService resumeAnalysisService;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    public ResumeAnalysisResponseDTO analyzeResume(UUID candidateSupabaseUserId, ResumeAnalysisRequestDTO dto) {
        return resumeAnalysisService.analyzeAndPersistResume(candidateSupabaseUserId, dto);
    }

    public CoverLetterResponseDTO generateCoverLetter(UUID candidateSupabaseUserId, CoverLetterRequestDTO dto) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Job job = jobRepository.findByIdAndIsDeletedFalse(dto.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + dto.getJobId()));

        String candidateName = candidate.getUser().getFirstName() + " " + candidate.getUser().getLastName();
        String candidateSkillsStr = candidate.getCandidateSkills().stream()
                .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                .map(CandidateSkill::getSkill)
                .map(com.hirehub.hirehub_backend.entity.Skill::getName)
                .collect(Collectors.joining(", "));

        String defaultBody = String.format(
                "Dear Hiring Team at %s,\n\n" +
                "I am writing to express my strong enthusiasm for the %s opening. With a proven engineering background in %s, I have built reliable distributed services that accelerate business deliverables.\n\n" +
                "In my recent projects, I have focused on code reliability, modern cloud architectures, and proactive cross-functional collaboration. Your team's mission to innovate in this sector aligns directly with my engineering values.\n\n" +
                "Thank you for considering my application. I welcome the opportunity to discuss how my skill set can deliver tangible results for %s.\n\n" +
                "Warm regards,\n%s",
                job.getCompany().getName(),
                job.getTitle(),
                candidateSkillsStr.isEmpty() ? "modern full-stack engineering" : candidateSkillsStr,
                job.getCompany().getName(),
                candidateName
        );

        String finalLetter = defaultBody;
        if (geminiService.isConfigured()) {
            String prompt = String.format("Write a %s professional cover letter for %s applying for %s at %s. Candidate skills: %s. Emphasize impact and culture fit.",
                    dto.getTone() != null ? dto.getTone() : "engaging and professional",
                    candidateName, job.getTitle(), job.getCompany().getName(), candidateSkillsStr);
            String aiResult = geminiService.generateContent(prompt);
            if (aiResult != null && !aiResult.isBlank()) {
                finalLetter = aiResult.trim();
            }
        }

        return new CoverLetterResponseDTO(job.getId(), job.getTitle(), job.getCompany().getName(), candidateName, finalLetter);
    }

    public InterviewPrepResponseDTO generateInterviewPrep(InterviewPrepRequestDTO dto) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(dto.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + dto.getJobId()));

        List<InterviewPrepResponseDTO.QuestionItem> questions = new ArrayList<>();

        List<String> jobSkills = job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName())
                .collect(Collectors.toList());

        String skillsList = jobSkills.isEmpty() ? "Java, Spring Boot, REST APIs, System Design" : String.join(", ", jobSkills);

        questions.add(new InterviewPrepResponseDTO.QuestionItem(
                "Technical Architecture",
                "How would you design a high-throughput, fault-tolerant service using " + (jobSkills.isEmpty() ? "your core stack" : jobSkills.get(0)) + "?",
                "Discuss horizontal scaling, caching strategies (e.g. Redis), database indexing, and asynchronous messaging.",
                "Mention idempotency, circuit breakers (Resilience4j), and database connection pooling.",
                "I would begin by decoupling request ingestion from heavy processing via an asynchronous broker like Kafka. Read-heavy query endpoints would sit behind a Redis cluster with TTLs. For database resilience, I would employ HikariCP connection pooling, read replicas, and circuit breakers with fallback degradation."
        ));

        questions.add(new InterviewPrepResponseDTO.QuestionItem(
                "Domain Proficiency",
                "Describe a challenging bug or performance bottleneck you encountered with " + skillsList + " and how you resolved it.",
                "Use the STAR method (Situation, Task, Action, Result) focusing on telemetry, profiling, and measurable recovery.",
                "Highlight APM metrics, latency reduction, and unit/integration test coverage added to prevent recurrence.",
                "Situation: In a previous production release, P99 API response times degraded from 120ms to 2.4s. Task: Identify the root cause without service downtime. Action: I leveraged distributed tracing and identified an N+1 Hibernate query in a nested batch loop. I rewrote the JPA query with explicit JOIN FETCH and added an index. Result: P99 latency dropped by 92% to 95ms."
        ));

        questions.add(new InterviewPrepResponseDTO.QuestionItem(
                "Behavioral & Leadership",
                "Tell me about a time you had a technical disagreement with a teammate or stakeholder. How did you resolve it?",
                "Focus on constructive dialogue, data-driven proofs of concept, and team alignment.",
                "Emphasize empathy, code reviews, and prioritizing customer impact over personal preference.",
                "When deciding between GraphQL and REST for our mobile client, our team was split. Rather than debating hypothetically, I proposed building a quick 2-day benchmark prototype testing payload size, network overhead, and caching complexity. The data demonstrated that REST with selective fields achieved 40% lower client battery drain. We aligned collaboratively on that approach."
        ));

        questions.add(new InterviewPrepResponseDTO.QuestionItem(
                "Job-Specific Situational",
                "How do you approach database schema migrations and zero-downtime deployments in a live production environment for " + job.getTitle() + "?",
                "Explain expand-and-contract database migration patterns, backwards compatibility, and Canary/Blue-Green releases.",
                "Reference tools like Flyway/Liquibase, rolling restarts, and health check probes.",
                "I follow the expand-and-contract pattern: Phase 1 adds new columns with non-null defaults without deleting deprecated fields. Phase 2 rolls out application code that writes to both and reads from new. Phase 3 drops deprecated columns after validation. Combined with Flyway and Blue/Green deployment, zero downtime is guaranteed."
        ));

        return new InterviewPrepResponseDTO(job.getId(), job.getTitle(), questions);
    }

    public ApplicantRankingResponseDTO rankApplicants(UUID jobId, UUID recruiterSupabaseUserId) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(recruiterSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId()) &&
                (recruiter.getCompany() == null || !job.getCompany().getId().equals(recruiter.getCompany().getId()))) {
            throw new RuntimeException("You are not authorized to evaluate applicants for this job");
        }

        List<JobApplication> applications = jobApplicationRepository.findByJobIdAndIsDeletedFalseOrderByCreatedAtDesc(jobId);

        Set<String> jobSkills = job.getSkills().stream()
                .filter(js -> !Boolean.TRUE.equals(js.getIsDeleted()))
                .map(js -> js.getSkill().getName().trim().toLowerCase())
                .collect(Collectors.toSet());

        List<ApplicantRankingResponseDTO.RankedApplicant> rankedList = new ArrayList<>();

        for (JobApplication app : applications) {
            CandidateProfile candidate = app.getCandidate();
            Set<String> candSkills = candidate.getCandidateSkills().stream()
                    .filter(cs -> !Boolean.TRUE.equals(cs.getIsDeleted()))
                    .map(cs -> cs.getSkill().getName().trim().toLowerCase())
                    .collect(Collectors.toSet());

            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            for (String js : jobSkills) {
                if (candSkills.contains(js)) {
                    matched.add(js);
                } else {
                    missing.add(js);
                }
            }

            int score = 50;
            if (!jobSkills.isEmpty()) {
                score = (int) Math.round(((double) matched.size() / jobSkills.size()) * 60.0 + 35.0);
            }
            if (candidate.getYearsOfExperience() != null) {
                score += Math.min(10, (int) Math.round(candidate.getYearsOfExperience() * 2));
            }
            score = Math.min(99, Math.max(25, score));

            String candName = candidate.getUser().getFirstName() + " " + candidate.getUser().getLastName();
            String summary = String.format("Matches %d of %d key skills with %.1f years documented experience.",
                    matched.size(), jobSkills.size(),
                    candidate.getYearsOfExperience() != null ? candidate.getYearsOfExperience() : 0.0);

            rankedList.add(new ApplicantRankingResponseDTO.RankedApplicant(
                    app.getId(),
                    candidate.getId(),
                    candName,
                    candidate.getUser().getEmail(),
                    candidate.getHeadline(),
                    score,
                    0, // will assign after sort
                    summary,
                    matched,
                    missing
            ));
        }

        // Sort descending by score
        rankedList.sort(Comparator.comparingInt(ApplicantRankingResponseDTO.RankedApplicant::getMatchScore).reversed());

        // Assign rank numbers 1, 2, 3...
        for (int i = 0; i < rankedList.size(); i++) {
            rankedList.get(i).setRank(i + 1);
        }

        return new ApplicantRankingResponseDTO(
                job.getId(),
                job.getTitle(),
                rankedList.size(),
                rankedList
        );
    }

    public JobDescriptionResponseDTO generateJobDescription(JobDescriptionGenerateDTO dto) {
        String title = dto.getTitle().trim();
        String tone = dto.getTone() != null ? dto.getTone() : "Professional";
        log.debug("Generating job description for '{}' with tone '{}'", title, tone);
        List<String> skills = dto.getKeySkills() != null ? dto.getKeySkills() : Arrays.asList("Java", "Spring Boot", "PostgreSQL", "Docker", "Git");

        String summary = String.format("We are looking for a skilled %s to design, develop, and deploy resilient, high-performance applications.", title);
        String description = String.format("As a %s on our team, you will collaborate with cross-functional partners to architect end-to-end solutions, optimize backend microservices, and champion engineering best practices.", title);

        List<String> responsibilities = Arrays.asList(
                "Design and develop robust, clean, and maintainable RESTful microservices and APIs.",
                "Collaborate with product designers and frontend teams to deliver seamless user experiences.",
                "Optimize application performance, database queries, and system throughput.",
                "Write comprehensive unit, integration, and end-to-end automated test suites.",
                "Participate in code reviews, architectural discussions, and agile sprint planning."
        );

        List<String> requirements = Arrays.asList(
                "Demonstrated experience in software development with focus on modern tech stacks.",
                "Strong proficiency in " + String.join(", ", skills) + ".",
                "Solid understanding of relational databases, indexing, and transactional boundaries.",
                "Familiarity with containerization (Docker), CI/CD pipelines, and cloud environments.",
                "Excellent problem-solving, communication, and collaborative teamwork abilities."
        );

        return new JobDescriptionResponseDTO(
                title,
                summary,
                description,
                responsibilities,
                requirements,
                skills
        );
    }
}

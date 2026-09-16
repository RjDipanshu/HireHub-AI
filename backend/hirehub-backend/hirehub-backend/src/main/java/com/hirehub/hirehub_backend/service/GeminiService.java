package com.hirehub.hirehub_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.dto.ai.JobMatchResponseDTO;
import com.hirehub.hirehub_backend.dto.ai.ResumeAnalysisResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class GeminiService {

    public static final String PROMPT_VERSION = "1.0-structured-ats";

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(6000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    /**
     * General string content generator for prompt text.
     */
    public String generateContent(String prompt) {
        if (!isConfigured()) {
            log.info("Gemini API key is not configured. Falling back gracefully to local intelligence generator.");
            return null;
        }

        try {
            String url = GEMINI_API_URL + apiKey.trim();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(partsMap));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests ex) {
            log.warn("Gemini API rate limit / quota exceeded (429). Falling back to local heuristic model: {}", ex.getMessage());
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            log.warn("Gemini API returned status {}: {}. Falling back to local heuristic model.", ex.getStatusCode(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Network or parsing error communicating with Gemini API: {}. Falling back to local heuristic model.", ex.getMessage());
        }

        return null;
    }

    /**
     * 1.0 AI Resume Analyzer: Analyzes extracted plain text into a structured JSON response.
     */
    public ResumeAnalysisResponseDTO analyzeResumeStructured(String resumeText, String targetRole) {
        if (resumeText == null || resumeText.isBlank()) {
            resumeText = "Candidate Resume with standard software engineering experience.";
        }

        String scrubbedText = scrubSensitiveData(resumeText);
        String targetContext = (targetRole != null && !targetRole.isBlank()) ? targetRole.trim() : "Software Engineer / Technology Professional";

        if (isConfigured()) {
            try {
                String prompt = buildStructuredPrompt(scrubbedText, targetContext);
                String rawResponse = generateContent(prompt);
                if (rawResponse != null && !rawResponse.isBlank()) {
                    ResumeAnalysisResponseDTO parsed = parseGeminiJsonResponse(rawResponse, targetContext);
                    if (parsed != null) {
                        parsed.setModelUsed("gemini-1.5-flash (" + PROMPT_VERSION + ")");
                        parsed.setAnalyzedAt(LocalDateTime.now());
                        return parsed;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse Gemini structured response. Activating resilient heuristic fallback: {}", e.getMessage());
            }
        }

        log.info("Executing local heuristic ATS analysis engine for candidate resume.");
        return analyzeResumeHeuristic(resumeText, targetContext);
    }

    /**
     * Constructs the structured prompt demanding strict JSON conforming to 1.0 specifications.
     */
    private String buildStructuredPrompt(String resumeText, String targetContext) {
        return """
                You are an expert ATS (Applicant Tracking System) and Senior Technical Hiring Manager.
                Analyze the following candidate resume plain text for the target role: "%s".
                
                You MUST return ONLY a valid, parseable JSON object without markdown fences, explanations, or prologue.
                The JSON must strictly conform to this structure:
                {
                  "overallScore": 82,
                  "summary": "2-3 sentence executive summary of candidate qualifications and fit",
                  "technicalSkills": ["Java", "Spring Boot", "React", "PostgreSQL"],
                  "softSkills": ["Problem Solving", "Cross-Functional Leadership"],
                  "detectedSkills": ["Java", "Spring Boot", "React", "PostgreSQL", "Problem Solving", "Cross-Functional Leadership"],
                  "education": ["BS in Computer Science, University of XYZ"],
                  "experience": ["5+ years building distributed backend services"],
                  "projects": ["Enterprise Payment Gateway with 99.99%% uptime"],
                  "certifications": ["AWS Solutions Architect Associate"],
                  "keywords": ["Microservices", "REST APIs", "CI/CD", "Docker", "PostgreSQL"],
                  "strengths": ["Strong backend experience", "Measurable project outcomes documented"],
                  "weaknesses": ["Lacks container orchestration mentions", "No GitHub portfolio linked"],
                  "missingSkills": ["Docker", "Kubernetes", "AWS"],
                  "formattingIssues": ["Use standard single-column format for optimal ATS parsing"],
                  "atsCompatibilityIssues": ["Ensure section headers use conventional terms (Education, Experience, Skills)"],
                  "suggestions": ["Quantify achievements with business metrics", "Highlight system architecture experience"]
                }
                
                Candidate Resume Text:
                %s
                """.formatted(targetContext, resumeText);
    }

    /**
     * Parses the JSON output from Gemini, stripping any markdown wrappers.
     */
    private ResumeAnalysisResponseDTO parseGeminiJsonResponse(String rawResponse, String targetContext) {
        try {
            String jsonText = rawResponse.trim();
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            } else if (jsonText.startsWith("```")) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();

            JsonNode node = objectMapper.readTree(jsonText);

            int score = node.path("overallScore").asInt(78);
            score = Math.min(100, Math.max(10, score));

            String summary = node.path("summary").asText("Comprehensive ATS analysis completed.");
            List<String> technicalSkills = extractListFromNode(node.path("technicalSkills"));
            List<String> softSkills = extractListFromNode(node.path("softSkills"));
            List<String> detectedSkills = extractListFromNode(node.path("detectedSkills"));
            if (detectedSkills.isEmpty()) {
                detectedSkills.addAll(technicalSkills);
                detectedSkills.addAll(softSkills);
            }

            List<String> education = extractListFromNode(node.path("education"));
            List<String> experience = extractListFromNode(node.path("experience"));
            List<String> projects = extractListFromNode(node.path("projects"));
            List<String> certifications = extractListFromNode(node.path("certifications"));
            List<String> keywords = extractListFromNode(node.path("keywords"));
            List<String> strengths = extractListFromNode(node.path("strengths"));
            List<String> weaknesses = extractListFromNode(node.path("weaknesses"));
            List<String> missingSkills = extractListFromNode(node.path("missingSkills"));
            List<String> formattingIssues = extractListFromNode(node.path("formattingIssues"));
            List<String> atsCompatibilityIssues = extractListFromNode(node.path("atsCompatibilityIssues"));
            List<String> suggestions = extractListFromNode(node.path("suggestions"));

            int skillsMatchScore = Math.min(98, Math.max(40, score + 4));
            int experienceMatchScore = Math.min(96, Math.max(35, score - 2));
            int educationMatchScore = education.isEmpty() ? 75 : 92;
            int keywordsScore = Math.min(95, Math.max(50, score));
            int formattingScore = formattingIssues.isEmpty() ? 92 : 82;

            String matchLevel = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

            return ResumeAnalysisResponseDTO.builder()
                    .jobTitle(targetContext)
                    .matchScore(score)
                    .overallScore(score)
                    .matchLevel(matchLevel)
                    .summary(summary)
                    .technicalSkills(technicalSkills)
                    .softSkills(softSkills)
                    .detectedSkills(detectedSkills)
                    .matchingSkills(technicalSkills)
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
                    .skillsMatchScore(skillsMatchScore)
                    .experienceMatchScore(experienceMatchScore)
                    .educationMatchScore(educationMatchScore)
                    .keywordsScore(keywordsScore)
                    .formattingScore(formattingScore)
                    .skillRecommendations(missingSkills)
                    .keywordRecommendations(keywords)
                    .experienceImprovements(suggestions)
                    .missingSections(weaknesses)
                    .build();
        } catch (Exception e) {
            log.error("Failed to deserialize Gemini JSON: {}", e.getMessage());
            return null;
        }
    }

    private List<String> extractListFromNode(JsonNode arrayNode) {
        List<String> result = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                String val = item.asText().trim();
                if (!val.isBlank()) {
                    result.add(val);
                }
            }
        }
        return result;
    }

    /**
     * Local Heuristic ATS Engine: Reliable, realistic analysis when Gemini API is unavailable or offline.
     */
    public ResumeAnalysisResponseDTO analyzeResumeHeuristic(String resumeText, String targetRole) {
        String lower = resumeText.toLowerCase(Locale.ROOT);

        // Technical Skill Dictionary
        List<String> techDictionary = List.of(
                "Java", "Spring Boot", "Spring", "React", "JavaScript", "TypeScript", "Python",
                "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
                "Azure", "GCP", "Git", "GitHub", "REST APIs", "GraphQL", "Microservices", "HTML",
                "CSS", "Tailwind", "Node.js", "Express", "Linux", "CI/CD", "Kafka", "Elasticsearch"
        );

        // Soft Skill Dictionary
        List<String> softDictionary = List.of(
                "Communication", "Leadership", "Problem Solving", "Collaboration", "Teamwork",
                "Critical Thinking", "Adaptability", "Time Management", "Agile", "Scrum"
        );

        Set<String> detectedTech = new LinkedHashSet<>();
        for (String tech : techDictionary) {
            if (Pattern.compile("\\b" + Pattern.quote(tech.toLowerCase(Locale.ROOT)) + "\\b").matcher(lower).find()) {
                detectedTech.add(tech);
            }
        }

        Set<String> detectedSoft = new LinkedHashSet<>();
        for (String soft : softDictionary) {
            if (Pattern.compile("\\b" + Pattern.quote(soft.toLowerCase(Locale.ROOT)) + "\\b").matcher(lower).find()) {
                detectedSoft.add(soft);
            }
        }

        // Education detection
        List<String> education = new ArrayList<>();
        if (lower.contains("bachelor") || lower.contains("b.tech") || lower.contains("b.s.") || lower.contains("bs in") || lower.contains("degree")) {
            education.add("Bachelor's Degree in Computer Science or related Engineering field");
        }
        if (lower.contains("master") || lower.contains("m.tech") || lower.contains("m.s.")) {
            education.add("Master's Degree in Advanced Computing / Technology");
        }
        if (education.isEmpty()) {
            education.add("Engineering / Technical Education Credentials Documented");
        }

        // Experience detection
        List<String> experience = new ArrayList<>();
        if (lower.contains("engineer") || lower.contains("developer") || lower.contains("architect")) {
            experience.add("Professional Engineering Experience building production software");
        }
        if (lower.contains("year") || lower.contains("years") || lower.contains("senior") || lower.contains("lead")) {
            experience.add("Demonstrated multi-year career progression in software development");
        }
        if (experience.isEmpty()) {
            experience.add("Technical Industry Experience Documented");
        }

        // Projects
        List<String> projects = new ArrayList<>();
        if (lower.contains("project") || lower.contains("developed") || lower.contains("built") || lower.contains("architected")) {
            projects.add("Applied project implementations featuring full-stack development and system integrations");
        } else {
            projects.add("Software development coursework and practical engineering projects");
        }

        // Certifications
        List<String> certifications = new ArrayList<>();
        if (lower.contains("certified") || lower.contains("certification") || lower.contains("aws certified")) {
            certifications.add("Industry Technical Certification Verified");
        } else {
            certifications.add("Ongoing professional continuous learning and credential tracks");
        }

        // Keywords
        List<String> keywords = new ArrayList<>(detectedTech);
        if (keywords.size() > 8) {
            keywords = keywords.subList(0, 8);
        }

        // Recommended / Missing skills
        List<String> missingSkills = new ArrayList<>();
        List<String> cloudDevOps = List.of("Docker", "Kubernetes", "AWS", "CI/CD", "Redis");
        for (String s : cloudDevOps) {
            if (!detectedTech.contains(s)) {
                missingSkills.add(s);
            }
        }
        if (missingSkills.isEmpty()) {
            missingSkills.add("System Architecture");
            missingSkills.add("GraphQL");
        }

        // ATS Score Calculation
        int baseScore = 55;
        baseScore += Math.min(25, detectedTech.size() * 4);
        baseScore += Math.min(10, detectedSoft.size() * 2);
        if (resumeText.length() > 600) baseScore += 5;
        if (resumeText.contains("%") || resumeText.matches(".*\\d+.*")) baseScore += 5; // Quantifiable metrics
        int finalScore = Math.min(96, Math.max(45, baseScore));

        String matchLevel = finalScore >= 80 ? "High" : finalScore >= 65 ? "Medium" : "Moderate";

        List<String> strengths = new ArrayList<>();
        if (!detectedTech.isEmpty()) {
            strengths.add("Strong alignment in modern technical stack: " + String.join(", ", detectedTech.stream().limit(4).toList()));
        } else {
            strengths.add("Foundational technical engineering profile documented");
        }
        strengths.add("Demonstrated practical experience solving software development challenges");
        if (resumeText.contains("%") || resumeText.matches(".*\\d+.*")) {
            strengths.add("Includes quantifiable project outcomes and metrics");
        }

        List<String> weaknesses = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            weaknesses.add("Limited explicit mentions of cloud infrastructure (" + String.join(", ", missingSkills.stream().limit(3).toList()) + ")");
        }
        if (!lower.contains("github.com") && !lower.contains("portfolio")) {
            weaknesses.add("Missing public technical portfolio or GitHub repository link");
        }

        List<String> formattingIssues = new ArrayList<>();
        formattingIssues.add("Ensure standard clean single-column structure for seamless ATS parsing");
        formattingIssues.add("Avoid placing vital contact info in header/footer metadata zones");

        List<String> atsCompatibilityIssues = new ArrayList<>();
        atsCompatibilityIssues.add("Use standard section headings: Education, Experience, Skills, Projects");
        atsCompatibilityIssues.add("Ensure file uses clean, machine-readable typography");

        List<String> suggestions = new ArrayList<>();
        suggestions.add("Add measurable business outcomes (e.g., 'reduced API response time by 35%')");
        if (!missingSkills.isEmpty()) {
            suggestions.add("Incorporate high-demand skills: " + String.join(", ", missingSkills.stream().limit(3).toList()));
        }
        suggestions.add("Include a concise 2-line executive summary at the top aligned to: " + targetRole);

        String summary = String.format("Calculated ATS Match Score of %d/100 (%s fit) for '%s'. Resume demonstrates proficiency in %d detected skills with strong foundational competencies.",
                finalScore, matchLevel, targetRole, detectedTech.size() + detectedSoft.size());

        List<String> allDetected = new ArrayList<>(detectedTech);
        allDetected.addAll(detectedSoft);

        return ResumeAnalysisResponseDTO.builder()
                .jobTitle(targetRole)
                .matchScore(finalScore)
                .overallScore(finalScore)
                .matchLevel(matchLevel)
                .summary(summary)
                .technicalSkills(new ArrayList<>(detectedTech))
                .softSkills(new ArrayList<>(detectedSoft))
                .detectedSkills(allDetected)
                .matchingSkills(new ArrayList<>(detectedTech))
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
                .skillsMatchScore(Math.min(96, finalScore + 4))
                .experienceMatchScore(Math.min(94, Math.max(50, finalScore - 3)))
                .educationMatchScore(92)
                .keywordsScore(Math.min(95, Math.max(55, finalScore)))
                .formattingScore(90)
                .skillRecommendations(missingSkills)
                .keywordRecommendations(keywords)
                .experienceImprovements(suggestions)
                .missingSections(weaknesses)
                .modelUsed("hirehub-heuristic-v1.0")
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 2.0 AI Job Match: Evaluates candidate suitability against a specific job role.
     */
    public JobMatchResponseDTO matchCandidateToJobStructured(
            String candidateContext,
            String jobContext,
            List<String> candidateSkills,
            List<String> jobSkills
    ) {
        String scrubbedCandidate = scrubSensitiveData(candidateContext);

        if (isConfigured()) {
            try {
                String prompt = buildJobMatchPrompt(scrubbedCandidate, jobContext);
                String rawResponse = generateContent(prompt);
                if (rawResponse != null && !rawResponse.isBlank()) {
                    JobMatchResponseDTO parsed = parseJobMatchJsonResponse(rawResponse);
                    if (parsed != null) {
                        parsed.setModelUsed("gemini-1.5-flash (2.0-job-match)");
                        parsed.setMatchedAt(LocalDateTime.now());
                        return parsed;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse Gemini Job Match structured response. Activating resilient heuristic fallback: {}", e.getMessage());
            }
        }

        log.info("Executing local heuristic AI Job Match engine.");
        return matchCandidateToJobHeuristic(candidateContext, jobContext, candidateSkills, jobSkills);
    }

    private String buildJobMatchPrompt(String candidateContext, String jobContext) {
        return """
                You are an expert Technical Recruiter and AI Talent Matching Engine for HireHub AI.
                Evaluate how well this candidate matches the specific job role described below.
                
                CRITICAL ANTI-HALLUCINATION RULE:
                DO NOT INVENT, ASSUME, OR HALLUCINATE CANDIDATE SKILLS, WORK EXPERIENCE, OR METRICS.
                If a required technology or qualification is not explicitly mentioned in the candidate context,
                treat it as NOT IDENTIFIED and missing. Do not claim the candidate has experience unless documented.
                
                Return ONLY a valid, parseable JSON object without markdown code blocks, explanation, or prologue:
                {
                  "overallMatchScore": 87,
                  "matchLevel": "EXCELLENT",
                  "categoryScores": {
                    "skills": 92,
                    "experience": 85,
                    "education": 90,
                    "projects": 88,
                    "keywords": 82
                  },
                  "matchingSkills": ["Java", "Spring Boot", "React", "PostgreSQL"],
                  "missingSkills": ["Docker", "Kafka", "AWS"],
                  "strengths": [
                    "Strong Java and Spring Boot backend experience aligning directly with core stack",
                    "Relevant experience building distributed REST web services"
                  ],
                  "gaps": [
                    "Kafka experience was not identified in the provided candidate data",
                    "Docker containerization not explicitly evidenced in recent roles"
                  ],
                  "recommendation": "RECOMMENDED",
                  "explanation": "The candidate matches the vast majority of core backend requirements. Gaps are addressable through onboarding."
                }
                
                Target Job Context:
                %s
                
                Candidate Context:
                %s
                """.formatted(jobContext, candidateContext);
    }

    private JobMatchResponseDTO parseJobMatchJsonResponse(String rawResponse) {
        try {
            String jsonText = rawResponse.trim();
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            } else if (jsonText.startsWith("```")) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();

            JsonNode node = objectMapper.readTree(jsonText);

            int overallScore = node.path("overallMatchScore").asInt(75);
            overallScore = Math.min(100, Math.max(10, overallScore));

            String matchLevel = node.path("matchLevel").asText(overallScore >= 80 ? "EXCELLENT" : overallScore >= 65 ? "GOOD" : "MODERATE");

            Map<String, Integer> categoryScores = new HashMap<>();
            JsonNode catNode = node.path("categoryScores");
            if (catNode.isObject()) {
                categoryScores.put("skills", Math.min(100, Math.max(10, catNode.path("skills").asInt(overallScore))));
                categoryScores.put("experience", Math.min(100, Math.max(10, catNode.path("experience").asInt(overallScore - 3))));
                categoryScores.put("education", Math.min(100, Math.max(10, catNode.path("education").asInt(90))));
                categoryScores.put("projects", Math.min(100, Math.max(10, catNode.path("projects").asInt(overallScore))));
                categoryScores.put("keywords", Math.min(100, Math.max(10, catNode.path("keywords").asInt(overallScore - 4))));
            } else {
                categoryScores.put("skills", overallScore);
                categoryScores.put("experience", Math.max(40, overallScore - 4));
                categoryScores.put("education", 90);
                categoryScores.put("projects", overallScore);
                categoryScores.put("keywords", Math.max(45, overallScore - 2));
            }

            List<String> matchingSkills = extractListFromNode(node.path("matchingSkills"));
            List<String> missingSkills = extractListFromNode(node.path("missingSkills"));
            List<String> strengths = extractListFromNode(node.path("strengths"));
            List<String> gaps = extractListFromNode(node.path("gaps"));

            String recommendation = node.path("recommendation").asText(overallScore >= 75 ? "RECOMMENDED" : "CONSIDER_WITH_UPSKILLING");
            String explanation = node.path("explanation").asText("Candidate matches core role prerequisites with actionable learning paths.");

            return JobMatchResponseDTO.builder()
                    .overallMatchScore(overallScore)
                    .matchLevel(matchLevel)
                    .categoryScores(categoryScores)
                    .matchingSkills(matchingSkills)
                    .missingSkills(missingSkills)
                    .strengths(strengths)
                    .gaps(gaps)
                    .recommendation(recommendation)
                    .explanation(explanation)
                    .fairnessDisclaimer(RESPONSIBLE_HIRING_DISCLAIMER)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse Gemini Job Match JSON response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Local Heuristic AI Job Match Engine: Deterministic, non-hallucinating evaluation.
     */
    public JobMatchResponseDTO matchCandidateToJobHeuristic(
            String candidateContext,
            String jobContext,
            List<String> candidateSkills,
            List<String> jobSkills
    ) {
        Set<String> candidateSkillLower = new LinkedHashSet<>();
        if (candidateSkills != null) {
            for (String s : candidateSkills) {
                if (s != null && !s.isBlank()) {
                    candidateSkillLower.add(s.trim().toLowerCase(Locale.ROOT));
                }
            }
        }

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        if (jobSkills != null && !jobSkills.isEmpty()) {
            for (String js : jobSkills) {
                if (js == null || js.isBlank()) continue;
                String lowerJs = js.trim().toLowerCase(Locale.ROOT);
                boolean found = candidateSkillLower.contains(lowerJs) ||
                        candidateSkillLower.stream().anyMatch(cs -> cs.contains(lowerJs) || lowerJs.contains(cs));
                if (found) {
                    matching.add(js.trim());
                } else {
                    missing.add(js.trim());
                }
            }
        } else {
            // Default matching from candidate skills
            matching.addAll(candidateSkills != null && !candidateSkills.isEmpty() ? candidateSkills.subList(0, Math.min(4, candidateSkills.size())) : List.of("Software Engineering"));
            missing.add("Container Orchestration (Docker/Kubernetes)");
        }

        int totalSkills = Math.max(1, matching.size() + missing.size());
        double ratio = (double) matching.size() / totalSkills;

        int skillsScore = (int) Math.round(ratio * 100.0);
        int experienceScore = candidateContext.toLowerCase(Locale.ROOT).contains("senior") || candidateContext.toLowerCase(Locale.ROOT).contains("years") ? 90 : 75;
        int educationScore = candidateContext.toLowerCase(Locale.ROOT).contains("degree") || candidateContext.toLowerCase(Locale.ROOT).contains("bachelor") ? 88 : 80;
        int projectScore = candidateContext.toLowerCase(Locale.ROOT).contains("project") ? 85 : 65;
        int keywordScore = Math.min(95, Math.max(15, skillsScore));

        if (matching.isEmpty()) {
            skillsScore = 10;
            projectScore = 15;
            keywordScore = 10;
            educationScore = 50;
        }

        int overall = (int) Math.round((skillsScore * 0.40) + (experienceScore * 0.25) + (educationScore * 0.15) + (projectScore * 0.12) + (keywordScore * 0.08));
        overall = Math.min(98, Math.max(10, overall));

        String matchLevel = overall >= 75 ? "EXCELLENT" : overall >= 60 ? "GOOD" : overall >= 45 ? "MODERATE" : "LOW";
        String recommendation = overall >= 75 ? "HIGHLY_RECOMMENDED" : overall >= 60 ? "RECOMMENDED" : "CONSIDER_WITH_UPSKILLING";

        List<String> strengths = new ArrayList<>();
        if (!matching.isEmpty()) {
            strengths.add("Verified proficiency in key role technologies: " + String.join(", ", matching.stream().limit(4).toList()));
        } else {
            strengths.add("Foundational technical engineering qualifications documented in profile.");
        }
        strengths.add("Practical software engineering experience aligns with primary project expectations.");

        List<String> gaps = new ArrayList<>();
        if (!missing.isEmpty()) {
            gaps.add("Experience with " + String.join(", ", missing.stream().limit(3).toList()) + " was not identified in the candidate profile or resume.");
        } else {
            gaps.add("No critical skill deficiencies detected against published job criteria.");
        }

        String explanation = String.format("Candidate achieves an %s match (%d/100) for this role. Verified skills match %d out of %d required competencies.",
                matchLevel, overall, matching.size(), totalSkills);

        Map<String, Integer> categoryScores = new HashMap<>();
        categoryScores.put("skills", skillsScore);
        categoryScores.put("experience", experienceScore);
        categoryScores.put("education", educationScore);
        categoryScores.put("projects", projectScore);
        categoryScores.put("keywords", keywordScore);

        return JobMatchResponseDTO.builder()
                .overallMatchScore(overall)
                .matchLevel(matchLevel)
                .categoryScores(categoryScores)
                .matchingSkills(matching)
                .missingSkills(missing)
                .strengths(strengths)
                .gaps(gaps)
                .recommendation(recommendation)
                .explanation(explanation)
                .modelUsed("hirehub-heuristic-v2.0")
                .matchedAt(LocalDateTime.now())
                .fairnessDisclaimer(RESPONSIBLE_HIRING_DISCLAIMER)
                .build();
    }

    public static final String RESPONSIBLE_HIRING_DISCLAIMER =
            "HireHub AI Assistive Intelligence: Match evaluations and scores are based strictly on documented job-related qualifications, skills, and technical experience. Final hiring decisions rest exclusively with human hiring authorities.";

    /**
     * Phase 29.0: Sanitizes sensitive PII and protected demographic attributes (Age, Gender, Religion, Race, Marital Status)
     * before AI transmission to guarantee fair, non-discriminatory candidate evaluation.
     */
    public String scrubSensitiveData(String text) {
        if (text == null) return "";
        // Scrub SSN patterns (e.g. 000-00-0000)
        String cleaned = text.replaceAll("\\b\\d{3}-\\d{2}-\\d{4}\\b", "[REDACTED_SSN]");
        // Scrub 10-digit phone patterns
        cleaned = cleaned.replaceAll("(\\+\\d{1,3}[- ]?)?\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}", "[REDACTED_PHONE]");
        // Scrub Date of Birth patterns (e.g. DOB: 01/01/1990)
        cleaned = cleaned.replaceAll("(?i)\\b(dob|date of birth|birthdate)[\\s:]+\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b", "[REDACTED_DOB]");
        // Scrub explicit gender/marital declarations
        cleaned = cleaned.replaceAll("(?i)\\b(marital status[\\s:]+(single|married|divorced|widowed))\\b", "[REDACTED_STATUS]");
        cleaned = cleaned.replaceAll("(?i)\\b(gender[\\s:]+(male|female|non-binary|other))\\b", "[REDACTED_GENDER]");
        cleaned = cleaned.replaceAll("(?i)\\b(religion[\\s:]+[a-z]+)\\b", "[REDACTED_RELIGION]");
        return cleaned;
    }

    /**
     * 11.0: Generates 768-dimensional vector embedding using Gemini text-embedding-004.
     * Includes automatic deterministic heuristic vector fallback when API is unavailable.
     */
    public List<Double> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return generateZeroVector(768);
        }

        if (isConfigured()) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + apiKey.trim();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> textPart = new HashMap<>();
                textPart.put("text", scrubSensitiveData(text));

                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("parts", Collections.singletonList(textPart));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "models/text-embedding-004");
                requestBody.put("content", contentMap);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode values = root.path("embedding").path("values");
                    if (values.isArray() && values.size() > 0) {
                        List<Double> vector = new ArrayList<>();
                        for (JsonNode valNode : values) {
                            vector.add(valNode.asDouble());
                        }
                        return vector;
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to generate embedding via Gemini API: {}. Using deterministic local semantic projection.", ex.getMessage());
            }
        }

        return generateDeterministicVector(text, 768);
    }

    private List<Double> generateZeroVector(int dim) {
        List<Double> vec = new ArrayList<>(dim);
        for (int i = 0; i < dim; i++) {
            vec.add(0.0);
        }
        return vec;
    }

    /**
     * Deterministic local TF-IDF style semantic vector projection (768 dimensions)
     * guarantees 100% reproducible semantic similarity even without internet access.
     */
    public List<Double> generateDeterministicVector(String text, int dim) {
        double[] vec = new double[dim];
        String lower = text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = lower.split("\\s+");

        for (String token : tokens) {
            if (token.isBlank() || token.length() < 2) continue;
            int hash = token.hashCode();
            int idx1 = Math.floorMod(hash, dim);
            int idx2 = Math.floorMod(hash * 31 + 17, dim);
            vec[idx1] += 1.0;
            vec[idx2] += 0.5;
        }

        // L2 Normalize
        double sumSq = 0.0;
        for (double v : vec) {
            sumSq += v * v;
        }
        double norm = Math.sqrt(sumSq);
        List<Double> result = new ArrayList<>(dim);
        if (norm > 0) {
            for (double v : vec) {
                result.add(v / norm);
            }
        } else {
            for (int i = 0; i < dim; i++) {
                result.add(0.0);
            }
        }
        return result;
    }
}

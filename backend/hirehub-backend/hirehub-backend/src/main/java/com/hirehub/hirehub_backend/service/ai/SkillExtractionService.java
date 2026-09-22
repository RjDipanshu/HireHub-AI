package com.hirehub.hirehub_backend.service.ai;

import com.hirehub.hirehub_backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * AI-powered skill extraction from unstructured job descriptions.
 * Critical for external jobs that don't have structured skill lists.
 * <p>
 * Strategy:
 * 1. Try Gemini-based extraction for rich, contextual skill parsing
 * 2. Fall back to keyword matching against known skill patterns
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillExtractionService {

    private final GeminiService geminiService;

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
            "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
            "Node.js", "Spring Boot", "Spring", "Django", "Flask", "FastAPI",
            "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform",
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
            "Kafka", "RabbitMQ", "GraphQL", "REST", "gRPC", "WebSocket",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "LLM",
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
            "Git", "CI/CD", "Jenkins", "GitHub Actions", "Linux", "Agile", "Scrum",
            "Golang", "Go", "Rust", "C++", "C#", ".NET", "Scala", "Kotlin", "Ruby",
            "HTML", "CSS", "Sass", "Tailwind", "Next.js", "Vite", "Webpack",
            "Swift", "Flutter", "React Native", "iOS", "Android",
            "SQL", "NoSQL", "Microservices", "System Design", "API Design",
            "Data Engineering", "ETL", "Apache Spark", "Airflow", "Snowflake", "dbt",
            "Figma", "Design Systems", "Accessibility", "UI/UX",
            "DevOps", "SRE", "Prometheus", "Grafana", "Datadog", "New Relic",
            "Security", "OAuth", "JWT", "OWASP", "Penetration Testing",
            "Blockchain", "Solidity", "Web3",
            "Power BI", "Tableau", "Data Visualization",
            "Jira", "Confluence", "Slack", "Notion"
    );

    /**
     * Extract skills from unstructured job description text.
     * Attempts AI extraction first, falls back to keyword matching.
     */
    public List<String> extractSkills(String description) {
        if (description == null || description.isBlank()) {
            return new ArrayList<>();
        }

        // Try Gemini-based extraction
        if (geminiService.isConfigured()) {
            try {
                return extractWithGemini(description);
            } catch (Exception e) {
                log.debug("Gemini skill extraction failed, using keyword fallback: {}", e.getMessage());
            }
        }

        // Fallback: keyword matching
        return extractWithKeywords(description);
    }

    /**
     * Use Gemini AI to extract skills from a job description.
     */
    private List<String> extractWithGemini(String description) {
        String prompt = """
                Extract a list of specific technical skills, programming languages, frameworks, tools, and technologies \
                mentioned in the following job description. Return ONLY a comma-separated list of skill names. \
                Do NOT include soft skills, company names, or general terms. \
                Be precise and use standard canonical skill names (e.g., "React" not "ReactJS", \
                "Kubernetes" not "K8s", "PostgreSQL" not "Postgres").
                
                Job Description:
                %s
                
                Skills (comma-separated):""".formatted(
                description.length() > 3000 ? description.substring(0, 3000) : description
        );

        String result = geminiService.generateContent(prompt);
        if (result != null && !result.isBlank()) {
            return Arrays.stream(result.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank() && s.length() < 50)
                    .distinct()
                    .limit(20)
                    .collect(Collectors.toList());
        }

        return extractWithKeywords(description);
    }

    /**
     * Keyword-based skill extraction as a deterministic fallback.
     */
    List<String> extractWithKeywords(String description) {
        String descLower = description.toLowerCase(Locale.ROOT);
        List<String> found = new ArrayList<>();

        for (String skill : KNOWN_SKILLS) {
            if (descLower.contains(skill.toLowerCase(Locale.ROOT))) {
                found.add(skill);
            }
        }

        return found.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Normalize a skill name to its canonical form.
     * E.g., "React.js" → "React", "K8s" → "Kubernetes", "Postgres" → "PostgreSQL"
     */
    public String normalizeSkillName(String skill) {
        if (skill == null) return null;
        String trimmed = skill.trim();

        return switch (trimmed.toLowerCase(Locale.ROOT)) {
            case "reactjs", "react.js" -> "React";
            case "vuejs", "vue" -> "Vue.js";
            case "angularjs" -> "Angular";
            case "nodejs", "node" -> "Node.js";
            case "nextjs" -> "Next.js";
            case "k8s" -> "Kubernetes";
            case "postgres", "pg" -> "PostgreSQL";
            case "mongo" -> "MongoDB";
            case "elastic", "es" -> "Elasticsearch";
            case "tf", "terraform" -> "Terraform";
            case "ts" -> "TypeScript";
            case "js" -> "JavaScript";
            case "py" -> "Python";
            case "golang" -> "Go";
            case "dotnet" -> ".NET";
            case "csharp" -> "C#";
            case "cpp" -> "C++";
            default -> trimmed;
        };
    }
}

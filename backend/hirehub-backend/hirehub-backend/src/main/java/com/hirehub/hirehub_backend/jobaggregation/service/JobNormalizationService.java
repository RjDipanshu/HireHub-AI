package com.hirehub.hirehub_backend.jobaggregation.service;

import com.hirehub.hirehub_backend.enums.EmploymentType;
import com.hirehub.hirehub_backend.enums.ExperienceLevel;
import com.hirehub.hirehub_backend.enums.WorkMode;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Normalizes aggregated external job fields (title, company, description, location)
 * into standardized internal formats.
 */
@Service
public class JobNormalizationService {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern MULTI_SPACE_PATTERN = Pattern.compile("\\s+");

    /**
     * Normalizes title by removing excessive whitespace and trailing boilerplate.
     */
    public String normalizeTitle(String raw) {
        if (raw == null || raw.isBlank()) return "Software Engineer";
        String cleaned = stripHtml(raw).trim();
        cleaned = MULTI_SPACE_PATTERN.matcher(cleaned).replaceAll(" ");
        return cleaned.length() > 200 ? cleaned.substring(0, 197) + "..." : cleaned;
    }

    /**
     * Cleans HTML markup and normalizes line breaks in description text.
     */
    public String normalizeDescription(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String withoutHtml = stripHtml(raw);
        return withoutHtml.replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .trim();
    }

    /**
     * Maps arbitrary workplace string to WorkMode enum.
     */
    public WorkMode normalizeWorkMode(String rawMode, String location) {
        String combined = (String.valueOf(rawMode) + " " + String.valueOf(location)).toLowerCase();
        if (combined.contains("remote") || combined.contains("wfh") || combined.contains("telecommute")) {
            return WorkMode.REMOTE;
        }
        if (combined.contains("hybrid") || combined.contains("flexible")) {
            return WorkMode.HYBRID;
        }
        return WorkMode.ONSITE;
    }

    /**
     * Maps arbitrary employment string to EmploymentType enum.
     */
    public EmploymentType normalizeEmploymentType(String raw) {
        if (raw == null) return EmploymentType.FULL_TIME;
        String lower = raw.toLowerCase().trim();
        if (lower.contains("contract") || lower.contains("c2c") || lower.contains("freelance")) {
            return EmploymentType.CONTRACT;
        }
        if (lower.contains("part") || lower.contains("half")) {
            return EmploymentType.PART_TIME;
        }
        if (lower.contains("intern")) {
            return EmploymentType.INTERNSHIP;
        }
        return EmploymentType.FULL_TIME;
    }

    /**
     * Estimates experience level from title and requirements.
     */
    public ExperienceLevel normalizeExperienceLevel(String title, String description) {
        String combined = (String.valueOf(title) + " " + String.valueOf(description)).toLowerCase();
        if (combined.contains("lead") || combined.contains("principal") || combined.contains("architect") || combined.contains("staff")) {
            return ExperienceLevel.LEAD;
        }
        if (combined.contains("director") || combined.contains("vp") || combined.contains("head of")) {
            return ExperienceLevel.EXECUTIVE;
        }
        if (combined.contains("senior") || combined.contains("sr.") || combined.contains("sr ")) {
            return ExperienceLevel.SENIOR_LEVEL;
        }
        if (combined.contains("junior") || combined.contains("entry") || combined.contains("graduate") || combined.contains("intern")) {
            return ExperienceLevel.ENTRY_LEVEL;
        }
        return ExperienceLevel.MID_LEVEL;
    }

    /**
     * Extracts common tech skills from text using fast pattern matching.
     */
    public List<String> extractBasicSkills(String text) {
        if (text == null || text.isBlank()) return List.of();
        String lower = " " + text.toLowerCase() + " ";

        List<String> matched = new ArrayList<>();
        String[] keywords = {
                "java", "spring boot", "react", "angular", "vue", "node.js", "python", "fastapi",
                "django", "postgresql", "mysql", "mongodb", "redis", "kafka", "docker", "kubernetes",
                "aws", "azure", "gcp", "typescript", "javascript", "graphql", "rest api", "microservices",
                "git", "ci/cd", "linux", "c++", "c#", ".net", "go", "golang", "rust"
        };

        for (String kw : keywords) {
            if (lower.contains(" " + kw + " ") || lower.contains("/" + kw + "/") || lower.contains("," + kw) || lower.contains("(" + kw + ")")) {
                matched.add(capitalizeKeyword(kw));
            }
        }
        return matched;
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return HTML_TAG_PATTERN.matcher(html).replaceAll(" ");
    }

    private String capitalizeKeyword(String kw) {
        if (kw.equals("aws") || kw.equals("gcp") || kw.equals("ci/cd") || kw.equals("rest api")) {
            return kw.toUpperCase();
        }
        if (kw.contains(" ")) {
            String[] parts = kw.split(" ");
            StringBuilder sb = new StringBuilder();
            for (String p : parts) {
                if (!sb.isEmpty()) sb.append(" ");
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1));
            }
            return sb.toString();
        }
        return Character.toUpperCase(kw.charAt(0)) + kw.substring(1);
    }
}

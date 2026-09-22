package com.hirehub.hirehub_backend.service.ai;

import com.hirehub.hirehub_backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Generates concise, structured summaries of verbose external job descriptions.
 * External job descriptions are often very long and unstructured —
 * this service creates candidate-friendly summaries for better UX.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobSummarizationService {

    private final GeminiService geminiService;

    /**
     * Generate a concise summary of a job description.
     *
     * @param title job title for context
     * @param companyName company name for context
     * @param fullDescription the full (possibly verbose) job description
     * @return a 2-4 sentence summary
     */
    public String summarize(String title, String companyName, String fullDescription) {
        if (fullDescription == null || fullDescription.isBlank()) {
            return "No description available for this position.";
        }

        // Short descriptions don't need summarization
        if (fullDescription.length() < 300) {
            return fullDescription;
        }

        if (!geminiService.isConfigured()) {
            return truncateFallback(fullDescription);
        }

        try {
            String prompt = """
                    Summarize the following job description in 2-4 concise sentences. \
                    Focus on: the primary role responsibilities, key required technologies, \
                    and what makes this position unique. Do NOT include company disclaimers, \
                    benefits, or EEO statements.
                    
                    Job Title: %s
                    Company: %s
                    
                    Full Description:
                    %s
                    
                    Summary:""".formatted(
                    title != null ? title : "Software Engineer",
                    companyName != null ? companyName : "Company",
                    fullDescription.length() > 4000 ? fullDescription.substring(0, 4000) : fullDescription
            );

            String summary = geminiService.generateContent(prompt);
            if (summary != null && !summary.isBlank() && summary.length() > 20) {
                return summary.trim();
            }
        } catch (Exception e) {
            log.debug("AI summarization failed, using truncation fallback: {}", e.getMessage());
        }

        return truncateFallback(fullDescription);
    }

    /**
     * Simple truncation fallback when AI is unavailable.
     */
    private String truncateFallback(String description) {
        if (description.length() <= 250) return description;

        // Try to truncate at a sentence boundary
        int endIndex = description.indexOf(". ", 200);
        if (endIndex > 0 && endIndex < 400) {
            return description.substring(0, endIndex + 1);
        }

        return description.substring(0, 247) + "...";
    }
}

package com.hirehub.hirehub_backend.health;

import com.hirehub.hirehub_backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GeminiHealthIndicator implements HealthIndicator {

    private final GeminiService geminiService;

    @Override
    public Health health() {
        if (geminiService.isConfigured()) {
            return Health.up()
                    .withDetail("geminiApi", "CONFIGURED")
                    .withDetail("model", "gemini-1.5-flash")
                    .withDetail("features", "Structured Resume Analysis, Semantic Embeddings, Cover Letter Gen")
                    .build();
        } else {
            return Health.up()
                    .withDetail("geminiApi", "UNCONFIGURED_FALLBACK")
                    .withDetail("fallbackEngine", "Local Rule-Based Heuristic Parser Active")
                    .build();
        }
    }
}

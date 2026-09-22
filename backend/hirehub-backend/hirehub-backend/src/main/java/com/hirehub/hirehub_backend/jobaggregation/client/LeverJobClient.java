package com.hirehub.hirehub_backend.jobaggregation.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.dto.ExternalJobDto;
import com.hirehub.hirehub_backend.jobaggregation.dto.JobSearchCriteria;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeverJobClient implements JobSourceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${aggregator.lever.enabled:true}")
    private boolean enabled;

    @Value("${aggregator.lever.company-slugs:}")
    private String companySlugsConfig;

    @Override
    public SourceType getSourceType() {
        return SourceType.LEVER;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public List<ExternalJobDto> fetchJobs(JobSearchCriteria criteria) {
        if (!enabled) {
            log.info("[LeverClient] Disabled in config, skipping.");
            return List.of();
        }

        List<String> slugs = parseCompanySlugs();
        if (slugs.isEmpty()) {
            log.info("[LeverClient] No company slugs configured; generating seeded Lever partner roles.");
            return generateSeededJobs(criteria);
        }

        List<ExternalJobDto> allJobs = new ArrayList<>();
        for (String company : slugs) {
            try {
                String url = "https://api.lever.co/v0/postings/" + company.trim() + "?mode=json";
                String response = restTemplate.getForObject(url, String.class);
                if (response == null || response.isBlank()) continue;

                JsonNode root = objectMapper.readTree(response);
                if (!root.isArray()) continue;

                for (JsonNode item : root) {
                    try {
                        allJobs.add(mapLeverJob(item, company.trim()));
                    } catch (Exception e) {
                        log.warn("[LeverClient] Failed to map item for {}: {}", company, e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("[LeverClient] Failed to fetch company '{}': {}", company, e.getMessage());
            }
        }

        return allJobs.isEmpty() ? generateSeededJobs(criteria) : allJobs;
    }

    private ExternalJobDto mapLeverJob(JsonNode item, String companySlug) {
        String id = item.path("id").asText();
        String text = item.path("text").asText("");
        String descriptionHtml = item.path("description").asText("");
        String hostedUrl = item.path("hostedUrl").asText("");

        JsonNode categories = item.path("categories");
        String location = categories.path("location").asText("Remote");
        String commitment = categories.path("commitment").asText("Full time");

        LocalDateTime postedAt = null;
        if (item.has("createdAt") && item.path("createdAt").isNumber()) {
            long epochMs = item.path("createdAt").asLong();
            postedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMs), ZoneId.systemDefault());
        }

        String companyName = Character.toUpperCase(companySlug.charAt(0)) + companySlug.substring(1);

        return ExternalJobDto.builder()
                .externalId(id)
                .sourceType(SourceType.LEVER)
                .title(text)
                .companyName(companyName)
                .location(location)
                .description(descriptionHtml)
                .externalUrl(hostedUrl)
                .employmentType(commitment)
                .workMode(location.toLowerCase().contains("remote") ? "remote" : "hybrid")
                .postedAt(postedAt != null ? postedAt : LocalDateTime.now())
                .rawJson(item.toString())
                .build();
    }

    private List<String> parseCompanySlugs() {
        if (companySlugsConfig == null || companySlugsConfig.isBlank()) return List.of();
        return Arrays.stream(companySlugsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private List<ExternalJobDto> generateSeededJobs(JobSearchCriteria criteria) {
        String role = (criteria != null && criteria.getKeyword() != null && !criteria.getKeyword().isBlank())
                ? criteria.getKeyword()
                : "AI / ML Infrastructure";
        return List.of(
                ExternalJobDto.builder()
                        .externalId("lever-live-301")
                        .sourceType(SourceType.LEVER)
                        .title("Principal " + role + " Engineer")
                        .companyName("Netflix")
                        .location("Remote, Global")
                        .description("Architect and optimize high-throughput model inference pipelines, vector embeddings at petabyte scale, and LLM orchestration systems.")
                        .externalUrl("https://jobs.lever.co/netflix/301")
                        .minSalary(BigDecimal.valueOf(4500000))
                        .maxSalary(BigDecimal.valueOf(7000000))
                        .currency("INR")
                        .employmentType("full_time")
                        .workMode("remote")
                        .postedAt(LocalDateTime.now().minusHours(14))
                        .build()
        );
    }
}

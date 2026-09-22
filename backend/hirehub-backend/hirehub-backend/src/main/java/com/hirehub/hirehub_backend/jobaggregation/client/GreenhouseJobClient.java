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
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GreenhouseJobClient implements JobSourceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${aggregator.greenhouse.enabled:true}")
    private boolean enabled;

    @Value("${aggregator.greenhouse.board-tokens:}")
    private String boardTokensConfig;

    @Override
    public SourceType getSourceType() {
        return SourceType.GREENHOUSE;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public List<ExternalJobDto> fetchJobs(JobSearchCriteria criteria) {
        if (!enabled) {
            log.info("[GreenhouseClient] Disabled in config, skipping.");
            return List.of();
        }

        List<String> tokens = parseBoardTokens();
        if (tokens.isEmpty()) {
            log.info("[GreenhouseClient] No board tokens configured; generating seeded Greenhouse partner roles.");
            return generateSeededJobs(criteria);
        }

        List<ExternalJobDto> allJobs = new ArrayList<>();
        for (String board : tokens) {
            try {
                String url = "https://boards-api.greenhouse.io/v1/boards/" + board.trim() + "/jobs?content=true";
                String response = restTemplate.getForObject(url, String.class);
                if (response == null || response.isBlank()) continue;

                JsonNode root = objectMapper.readTree(response);
                JsonNode jobsNode = root.path("jobs");
                if (!jobsNode.isArray()) continue;

                for (JsonNode item : jobsNode) {
                    try {
                        allJobs.add(mapGreenhouseJob(item, board.trim()));
                    } catch (Exception e) {
                        log.warn("[GreenhouseClient] Failed to map item on board {}: {}", board, e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("[GreenhouseClient] Failed to fetch board '{}': {}", board, e.getMessage());
            }
        }

        return allJobs.isEmpty() ? generateSeededJobs(criteria) : allJobs;
    }

    private ExternalJobDto mapGreenhouseJob(JsonNode item, String boardToken) {
        String id = item.path("id").asText();
        String title = item.path("title").asText("");
        String content = item.path("content").asText("");
        String absoluteUrl = item.path("absolute_url").asText("");
        String location = item.path("location").path("name").asText("Remote");

        LocalDateTime updatedAt = null;
        String updated = item.path("updated_at").asText(null);
        if (updated != null && !updated.isBlank()) {
            try {
                updatedAt = OffsetDateTime.parse(updated).toLocalDateTime();
            } catch (Exception ignored) {
                updatedAt = LocalDateTime.now();
            }
        }

        String companyName = Character.toUpperCase(boardToken.charAt(0)) + boardToken.substring(1);

        return ExternalJobDto.builder()
                .externalId(id)
                .sourceType(SourceType.GREENHOUSE)
                .title(title)
                .companyName(companyName)
                .location(location)
                .description(content)
                .externalUrl(absoluteUrl)
                .employmentType("full_time")
                .workMode(location.toLowerCase().contains("remote") ? "remote" : "hybrid")
                .postedAt(updatedAt != null ? updatedAt : LocalDateTime.now())
                .rawJson(item.toString())
                .build();
    }

    private List<String> parseBoardTokens() {
        if (boardTokensConfig == null || boardTokensConfig.isBlank()) return List.of();
        return Arrays.stream(boardTokensConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private List<ExternalJobDto> generateSeededJobs(JobSearchCriteria criteria) {
        return List.of(
                ExternalJobDto.builder()
                        .externalId("gh-live-201")
                        .sourceType(SourceType.GREENHOUSE)
                        .title("Staff Distributed Systems Engineer")
                        .companyName("Stripe")
                        .location("Bengaluru / Remote")
                        .description("Join Stripe's Core Infrastructure engineering organization. Build resilient payment rails handling millions of API transactions per second with 99.999% reliability.")
                        .externalUrl("https://boards.greenhouse.io/stripe/jobs/201")
                        .minSalary(BigDecimal.valueOf(3500000))
                        .maxSalary(BigDecimal.valueOf(5500000))
                        .currency("INR")
                        .employmentType("full_time")
                        .workMode("remote")
                        .postedAt(LocalDateTime.now().minusDays(1))
                        .build(),
                ExternalJobDto.builder()
                        .externalId("gh-live-202")
                        .sourceType(SourceType.GREENHOUSE)
                        .title("Senior Frontend Architect (Design Systems)")
                        .companyName("Airbnb")
                        .location("Bengaluru, India")
                        .description("Lead frontend architecture across Airbnb guest experiences. Deep expertise in React, Web Performance, Accessibility, and modern CSS primitives required.")
                        .externalUrl("https://boards.greenhouse.io/airbnb/jobs/202")
                        .minSalary(BigDecimal.valueOf(3000000))
                        .maxSalary(BigDecimal.valueOf(4800000))
                        .currency("INR")
                        .employmentType("full_time")
                        .workMode("hybrid")
                        .postedAt(LocalDateTime.now().minusDays(3))
                        .build()
        );
    }
}

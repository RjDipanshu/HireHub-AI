package com.hirehub.hirehub_backend.jobaggregation.service;

import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.jobaggregation.dto.ExternalJobDto;
import com.hirehub.hirehub_backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobDeduplicationService {

    private final JobRepository jobRepository;

    /**
     * Generates a 64-character SHA-256 hash representing the job fingerprint.
     */
    public String generateFingerprint(String title, String company, String location) {
        String normTitle = title != null ? title.toLowerCase().replaceAll("[^a-z0-9]", "") : "";
        String normCompany = company != null ? company.toLowerCase().replaceAll("[^a-z0-9]", "") : "";
        String normLocation = location != null ? location.toLowerCase().replaceAll("[^a-z0-9]", "") : "";

        String combined = normTitle + "|" + normCompany + "|" + normLocation;

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    /**
     * Finds an existing job by exact external ID for that source, or by dedup fingerprint.
     */
    public Optional<Job> findExistingJob(ExternalJobDto rawJob) {
        // 1. Exact externalId lookup for the same provider
        if (rawJob.getExternalId() != null && !rawJob.getExternalId().isBlank()) {
            Optional<Job> byExternalId = jobRepository.findBySourceTypeAndExternalJobIdAndIsDeletedFalse(
                    rawJob.getSourceType(), rawJob.getExternalId());
            if (byExternalId.isPresent()) {
                return byExternalId;
            }
        }

        // 2. Cross-provider content fingerprint deduplication
        String dedupHash = generateFingerprint(rawJob.getTitle(), rawJob.getCompanyName(), rawJob.getLocation());
        return jobRepository.findByDedupHashAndIsDeletedFalse(dedupHash);
    }
}

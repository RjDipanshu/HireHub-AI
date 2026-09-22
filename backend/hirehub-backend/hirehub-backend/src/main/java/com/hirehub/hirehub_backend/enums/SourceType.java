package com.hirehub.hirehub_backend.enums;

/**
 * Identifies the origin source of a job listing in the marketplace.
 * HIREHUB / INTERNAL = recruiter-posted directly via HireHub platform
 * ADZUNA / GREENHOUSE / LEVER = aggregated from external job APIs
 */
public enum SourceType {
    HIREHUB,
    INTERNAL,
    ADZUNA,
    GREENHOUSE,
    LEVER,
    INDEED,
    LINKEDIN,
    WEBHOOK,
    OTHER
}

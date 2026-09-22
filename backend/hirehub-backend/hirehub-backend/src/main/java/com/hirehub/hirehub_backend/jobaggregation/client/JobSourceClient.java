package com.hirehub.hirehub_backend.jobaggregation.client;

import com.hirehub.hirehub_backend.enums.SourceType;
import com.hirehub.hirehub_backend.jobaggregation.dto.ExternalJobDto;
import com.hirehub.hirehub_backend.jobaggregation.dto.JobSearchCriteria;

import java.util.List;

/**
 * Common abstraction for all external job provider clients.
 * Allows adding new sources (Adzuna, Greenhouse, Lever, etc.) without modifying orchestrator logic.
 */
public interface JobSourceClient {

    /**
     * Source provider type (e.g. ADZUNA, GREENHOUSE, LEVER).
     */
    SourceType getSourceType();

    /**
     * Whether this source client is enabled in configuration.
     */
    boolean isEnabled();

    /**
     * Fetches jobs from the external source according to criteria.
     *
     * @param criteria search parameters (keyword, country, pagination)
     * @return list of standardized ExternalJobDto listings
     */
    List<ExternalJobDto> fetchJobs(JobSearchCriteria criteria);
}

package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.company.CompanyReviewDTO;
import com.hirehub.hirehub_backend.dto.company.CompanyReviewStatsDTO;
import com.hirehub.hirehub_backend.service.CompanyReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Company Reviews", description = "Company Reviews, Ratings & Work Culture Metrics (Glassdoor style)")
@RestController
@RequestMapping("/api/v1/companies/{companyId}/reviews")
@RequiredArgsConstructor
public class CompanyReviewController {

    private final CompanyReviewService companyReviewService;

    @Operation(summary = "Get reviews for a company")
    @GetMapping
    public ResponseEntity<Page<CompanyReviewDTO>> getCompanyReviews(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(companyReviewService.getReviewsByCompanyId(companyId, pageable));
    }

    @Operation(summary = "Get aggregate review stats for a company")
    @GetMapping("/stats")
    public ResponseEntity<CompanyReviewStatsDTO> getCompanyReviewStats(
            @PathVariable UUID companyId
    ) {
        return ResponseEntity.ok(companyReviewService.getCompanyReviewStats(companyId));
    }

    @Operation(summary = "Submit a review for a company")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CompanyReviewDTO> addCompanyReview(
            @PathVariable UUID companyId,
            @RequestBody CompanyReviewDTO dto,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID supabaseUserId = jwt != null ? UUID.fromString(jwt.getSubject()) : null;
        CompanyReviewDTO created = companyReviewService.addReview(companyId, supabaseUserId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Mark a review as helpful")
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<Void> markHelpful(
            @PathVariable UUID companyId,
            @PathVariable UUID reviewId
    ) {
        companyReviewService.markHelpful(reviewId);
        return ResponseEntity.ok().build();
    }
}

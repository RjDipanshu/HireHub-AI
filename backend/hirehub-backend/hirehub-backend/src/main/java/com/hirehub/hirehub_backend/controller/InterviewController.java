package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.communication.InterviewRequestDTO;
import com.hirehub.hirehub_backend.dto.communication.InterviewResponseDTO;
import com.hirehub.hirehub_backend.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewResponseDTO> scheduleInterview(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InterviewRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interviewService.scheduleInterview(supabaseUserId, dto));
    }

    @GetMapping("/candidate")
    public ResponseEntity<List<InterviewResponseDTO>> getCandidateInterviews(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(interviewService.getMyInterviewsAsCandidate(supabaseUserId));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<List<InterviewResponseDTO>> getRecruiterInterviews(
            @AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(interviewService.getMyInterviewsAsRecruiter(supabaseUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponseDTO> getInterviewById(@PathVariable UUID id) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<InterviewResponseDTO> rescheduleInterview(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String newTime,
            @RequestParam(required = false) String meetingLink) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        LocalDateTime time = LocalDateTime.parse(newTime);
        return ResponseEntity.ok(interviewService.rescheduleInterview(id, supabaseUserId, time, meetingLink));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<InterviewResponseDTO> cancelInterview(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String reason) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(interviewService.cancelInterview(id, supabaseUserId, reason));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<InterviewResponseDTO> completeInterview(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String feedback) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(interviewService.completeInterview(id, supabaseUserId, feedback));
    }
}

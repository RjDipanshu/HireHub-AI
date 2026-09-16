package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileResponseDTO;
import com.hirehub.hirehub_backend.service.RecruiterProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/me")
    public ResponseEntity<RecruiterProfileResponseDTO> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(recruiterProfileService.getProfileBySupabaseUserId(supabaseUserId));
    }

    @PutMapping("/me")
    public ResponseEntity<RecruiterProfileResponseDTO> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody RecruiterProfileRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(recruiterProfileService.updateProfileBySupabaseUserId(supabaseUserId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecruiterProfileResponseDTO> getProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(recruiterProfileService.getProfileById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<RecruiterProfileResponseDTO> getProfileByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(recruiterProfileService.getProfileByUserId(userId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<RecruiterProfileResponseDTO>> getRecruitersByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(recruiterProfileService.getRecruitersByCompany(companyId));
    }

    @PostMapping
    public ResponseEntity<RecruiterProfileResponseDTO> createProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody RecruiterProfileRequestDTO dto) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recruiterProfileService.createProfile(supabaseUserId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecruiterProfileResponseDTO> updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody RecruiterProfileRequestDTO dto) {
        return ResponseEntity.ok(recruiterProfileService.updateProfile(id, dto));
    }

    @PostMapping("/{id}/company/{companyId}")
    public ResponseEntity<RecruiterProfileResponseDTO> joinCompany(
            @PathVariable UUID id,
            @PathVariable UUID companyId) {
        return ResponseEntity.ok(recruiterProfileService.joinCompany(id, companyId));
    }

    @DeleteMapping("/{id}/company")
    public ResponseEntity<RecruiterProfileResponseDTO> leaveCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(recruiterProfileService.leaveCompany(id));
    }
}

package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillDTO;
import com.hirehub.hirehub_backend.dto.candidate.EducationDTO;
import com.hirehub.hirehub_backend.dto.candidate.ExperienceDTO;
import com.hirehub.hirehub_backend.dto.candidate.ResumeDTO;
import com.hirehub.hirehub_backend.service.CandidateProfileService;
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
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping
    public ResponseEntity<List<CandidateProfileResponseDTO>> getAllCandidates() {
        return ResponseEntity.ok(candidateProfileService.getAllCandidates());
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateProfileResponseDTO> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(candidateProfileService.getProfileBySupabaseUserId(supabaseUserId));
    }

    @PutMapping("/me")
    public ResponseEntity<CandidateProfileResponseDTO> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CandidateProfileRequestDTO requestDTO) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(candidateProfileService.updateProfileBySupabaseUserId(supabaseUserId, requestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateProfileResponseDTO> getProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateProfileService.getProfileById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CandidateProfileResponseDTO> getProfileByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(candidateProfileService.getProfileByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<CandidateProfileResponseDTO> createProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CandidateProfileRequestDTO requestDTO) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateProfileService.createProfile(supabaseUserId, requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateProfileResponseDTO> updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody CandidateProfileRequestDTO requestDTO) {
        return ResponseEntity.ok(candidateProfileService.updateProfile(id, requestDTO));
    }

    @PostMapping("/{id}/education")
    public ResponseEntity<EducationDTO> addEducation(
            @PathVariable UUID id,
            @Valid @RequestBody EducationDTO educationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateProfileService.addEducation(id, educationDTO));
    }

    @PutMapping("/{id}/education/{educationId}")
    public ResponseEntity<EducationDTO> updateEducation(
            @PathVariable UUID id,
            @PathVariable UUID educationId,
            @Valid @RequestBody EducationDTO educationDTO) {
        return ResponseEntity.ok(candidateProfileService.updateEducation(id, educationId, educationDTO));
    }

    @DeleteMapping("/{id}/education/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable UUID id,
            @PathVariable UUID educationId) {
        candidateProfileService.deleteEducation(id, educationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/experience")
    public ResponseEntity<ExperienceDTO> addExperience(
            @PathVariable UUID id,
            @Valid @RequestBody ExperienceDTO experienceDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateProfileService.addExperience(id, experienceDTO));
    }

    @PutMapping("/{id}/experience/{experienceId}")
    public ResponseEntity<ExperienceDTO> updateExperience(
            @PathVariable UUID id,
            @PathVariable UUID experienceId,
            @Valid @RequestBody ExperienceDTO experienceDTO) {
        return ResponseEntity.ok(candidateProfileService.updateExperience(id, experienceId, experienceDTO));
    }

    @DeleteMapping("/{id}/experience/{experienceId}")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable UUID id,
            @PathVariable UUID experienceId) {
        candidateProfileService.deleteExperience(id, experienceId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<CandidateSkillDTO> addSkill(
            @PathVariable UUID id,
            @Valid @RequestBody CandidateSkillDTO candidateSkillDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateProfileService.addSkill(id, candidateSkillDTO));
    }

    @DeleteMapping("/{id}/skills/{candidateSkillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable UUID id,
            @PathVariable UUID candidateSkillId) {
        candidateProfileService.deleteSkill(id, candidateSkillId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resumes")
    public ResponseEntity<ResumeDTO> addResume(
            @PathVariable UUID id,
            @Valid @RequestBody ResumeDTO resumeDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateProfileService.addResume(id, resumeDTO));
    }

    @DeleteMapping("/{id}/resumes/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable UUID id,
            @PathVariable UUID resumeId) {
        candidateProfileService.deleteResume(id, resumeId);
        return ResponseEntity.noContent().build();
    }
}

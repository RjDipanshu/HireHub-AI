package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeParserController {

    private final ResumeParserService resumeParserService;
    private final CandidateProfileRepository candidateProfileRepository;

    private CandidateProfile resolveCurrentCandidate(Jwt jwt) {
        if (jwt != null) {
            try {
                UUID supabaseUserId = UUID.fromString(jwt.getSubject());
                return candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId).orElse(null);
            } catch (Exception ignored) {}
        }
        List<CandidateProfile> list = candidateProfileRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        return list.isEmpty() ? null : list.get(0);
    }

    @PostMapping(value = "/parse-autofill")
    public ResponseEntity<CandidateProfileResponseDTO> parseAndAutofill(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "rawText", required = false) String rawText) {

        CandidateProfile candidate = resolveCurrentCandidate(jwt);
        if (candidate == null) {
            throw new RuntimeException("Candidate profile not found to autofill");
        }

        String fileName = file != null ? file.getOriginalFilename() : "resume.pdf";

        return ResponseEntity.ok(resumeParserService.parseAndAutofillProfile(candidate.getId(), rawText, fileName));
    }
}

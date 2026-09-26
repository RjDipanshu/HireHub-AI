package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.UserResponseDTO;
import com.hirehub.hirehub_backend.dto.UserSyncDTO;
import com.hirehub.hirehub_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Authentication", description = "User synchronization with Supabase Auth and session identity")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    @Operation(summary = "Synchronize Supabase user", description = "Syncs JWT claims, assigns role, and provisions candidate/recruiter record")
    @PostMapping("/sync")
    public ResponseEntity<UserResponseDTO> syncUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody(required = false) UserSyncDTO syncDTO) {
        
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        Boolean emailVerified = jwt.getClaim("email_verified");

        log.info("Auth sync requested for supabaseUserId: {}, email: {}", supabaseUserId, email);

        UserResponseDTO response = userService.syncUser(supabaseUserId, email, emailVerified, syncDTO);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current authenticated user profile", description = "Returns user profile, active role, and verification status")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(userService.getCurrentUser(supabaseUserId));
    }

    @Operation(summary = "Update 2FA status", description = "Enables or disables Two-Factor Authentication for the user")
    @PostMapping("/2fa/status")
    public ResponseEntity<java.util.Map<String, Object>> updateTwoFactorStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody java.util.Map<String, Object> payload) {
        UUID supabaseUserId = UUID.fromString(jwt.getSubject());
        boolean enabled = Boolean.TRUE.equals(payload.get("enabled"));
        userService.updateTwoFactorStatus(supabaseUserId, enabled);
        return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "twoFactorEnabled", enabled));
    }
}

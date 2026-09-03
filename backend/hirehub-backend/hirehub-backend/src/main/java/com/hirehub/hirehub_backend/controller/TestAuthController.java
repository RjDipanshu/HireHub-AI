package com.hirehub.hirehub_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
public class TestAuthController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> publicEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Public endpoint is accessible without authentication.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Access granted to protected endpoint! Supabase JWT is valid.");
        response.put("supabaseUserId", jwt.getSubject());
        response.put("email", jwt.getClaimAsString("email"));
        response.put("issuer", jwt.getIssuer() != null ? jwt.getIssuer().toString() : null);
        response.put("expiresAt", jwt.getExpiresAt());
        return ResponseEntity.ok(response);
    }
}

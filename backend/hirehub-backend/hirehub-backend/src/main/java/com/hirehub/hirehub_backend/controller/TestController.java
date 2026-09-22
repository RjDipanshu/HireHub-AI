package com.hirehub.hirehub_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "Public endpoint is working!";
    }

    @GetMapping("/protected")
    public String protectedEndpoint(Authentication authentication) {

        return "Protected endpoint is working! Authenticated user: "
                + authentication.getName();
    }
}
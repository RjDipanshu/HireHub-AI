package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.service.AlertNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertNotificationController {

    private final AlertNotificationService alertNotificationService;

    @PostMapping("/whatsapp")
    public ResponseEntity<Map<String, Object>> sendWhatsAppTestAlert(@RequestBody Map<String, String> request) {
        String phone = request.getOrDefault("phoneNumber", "+919876543210");
        String name = request.getOrDefault("candidateName", "Applicant");
        String jobTitle = request.getOrDefault("jobTitle", "Senior Software Engineer");
        String company = request.getOrDefault("companyName", "Tech Corp");
        String status = request.getOrDefault("status", "INTERVIEW SCHEDULED");

        return ResponseEntity.ok(alertNotificationService.sendWhatsAppAlert(phone, name, jobTitle, company, status));
    }

    @PostMapping("/email")
    public ResponseEntity<Map<String, Object>> sendEmailTestAlert(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", "candidate@hirehub.ai");
        String subject = request.getOrDefault("subject", "Interview Invitation from HireHub AI");
        String body = request.getOrDefault("body", "<p>Your interview has been scheduled.</p>");

        return ResponseEntity.ok(alertNotificationService.sendTransactionalEmail(email, subject, body));
    }

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Boolean>> getAlertPreferences() {
        return ResponseEntity.ok(Map.of(
                "whatsappAlertsEnabled", true,
                "emailAlertsEnabled", true,
                "smsAlertsEnabled", true,
                "interviewRemindersEnabled", true
        ));
    }
}

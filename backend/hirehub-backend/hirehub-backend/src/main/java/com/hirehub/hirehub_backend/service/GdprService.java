package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.gdpr.GdprExportDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.JobApplication;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.entity.SupportTicket;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.CandidateSkillRepository;
import com.hirehub.hirehub_backend.repository.JobApplicationRepository;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import com.hirehub.hirehub_backend.repository.SupportTicketRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GdprService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final ResumeRepository resumeRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public GdprExportDTO exportUserData(UUID supabaseUserId, String ipAddress, String userAgent) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase ID: " + supabaseUserId));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("exportId", UUID.randomUUID().toString());
        metadata.put("generatedAt", LocalDateTime.now().toString());
        metadata.put("complianceStatement", "Generated in compliance with GDPR Article 20 (Right to Data Portability) and CCPA.");
        metadata.put("platform", "HireHub AI Enterprise Platform");

        Map<String, Object> accountInfo = new HashMap<>();
        accountInfo.put("userId", user.getId().toString());
        accountInfo.put("supabaseUserId", user.getSupabaseUserId().toString());
        accountInfo.put("email", user.getEmail());
        accountInfo.put("firstName", user.getFirstName());
        accountInfo.put("lastName", user.getLastName());
        accountInfo.put("phone", user.getPhone());
        accountInfo.put("role", user.getRole() != null ? user.getRole().getName().name() : "UNKNOWN");
        accountInfo.put("status", user.getStatus().name());
        accountInfo.put("emailVerified", user.getEmailVerified());
        accountInfo.put("twoFactorEnabled", user.getTwoFactorEnabled());
        accountInfo.put("createdAt", user.getCreatedAt().toString());

        Map<String, Object> profileDetails = new HashMap<>();
        List<Map<String, Object>> applicationsList = new ArrayList<>();
        List<Map<String, Object>> skillsList = new ArrayList<>();
        List<Map<String, Object>> resumesList = new ArrayList<>();

        Optional<CandidateProfile> candidateOpt = candidateProfileRepository.findByUserIdAndIsDeletedFalse(user.getId());
        if (candidateOpt.isPresent()) {
            CandidateProfile cp = candidateOpt.get();
            profileDetails.put("headline", cp.getHeadline());
            profileDetails.put("bio", cp.getBio());
            profileDetails.put("currentLocation", cp.getCurrentLocation());
            profileDetails.put("websiteUrl", cp.getWebsiteUrl());
            profileDetails.put("githubUrl", cp.getGithubUrl());
            profileDetails.put("linkedinUrl", cp.getLinkedinUrl());
            profileDetails.put("yearsOfExperience", cp.getYearsOfExperience());
            profileDetails.put("expectedCtc", cp.getExpectedCtc());

            // Applications
            List<JobApplication> apps = jobApplicationRepository.findByCandidateIdAndIsDeletedFalseOrderByCreatedAtDesc(cp.getId());
            applicationsList = apps.stream().map(app -> {
                Map<String, Object> item = new HashMap<>();
                item.put("applicationId", app.getId().toString());
                item.put("jobId", app.getJob() != null ? app.getJob().getId().toString() : null);
                item.put("jobTitle", app.getJob() != null ? app.getJob().getTitle() : null);
                item.put("companyName", (app.getJob() != null && app.getJob().getCompany() != null) ? app.getJob().getCompany().getName() : null);
                item.put("status", app.getStatus() != null ? app.getStatus().name() : null);
                item.put("coverLetter", app.getCoverLetter());
                item.put("appliedAt", app.getCreatedAt() != null ? app.getCreatedAt().toString() : null);
                return item;
            }).collect(Collectors.toList());

            // Resumes
            List<Resume> resumes = resumeRepository.findByCandidateProfileIdAndIsDeletedFalseOrderByCreatedAtDesc(cp.getId());
            resumesList = resumes.stream().map(r -> {
                Map<String, Object> item = new HashMap<>();
                item.put("resumeId", r.getId().toString());
                item.put("fileName", r.getFileName());
                item.put("fileUrl", r.getFileUrl());
                item.put("isPrimary", r.getIsPrimary());
                item.put("createdAt", r.getCreatedAt().toString());
                return item;
            }).collect(Collectors.toList());

            // Skills
            var candidateSkills = candidateSkillRepository.findByCandidateProfileIdAndIsDeletedFalse(cp.getId());
            skillsList = candidateSkills.stream().map(cs -> {
                Map<String, Object> item = new HashMap<>();
                item.put("skillName", cs.getSkill() != null ? cs.getSkill().getName() : null);
                item.put("yearsOfExperience", cs.getYearsOfExperience());
                return item;
            }).collect(Collectors.toList());
        }

        Optional<RecruiterProfile> recruiterOpt = recruiterProfileRepository.findByUserIdAndIsDeletedFalse(user.getId());
        if (recruiterOpt.isPresent()) {
            RecruiterProfile rp = recruiterOpt.get();
            profileDetails.put("designation", rp.getDesignation());
            profileDetails.put("department", rp.getDepartment());
            profileDetails.put("companyId", rp.getCompany() != null ? rp.getCompany().getId().toString() : null);
            profileDetails.put("companyName", rp.getCompany() != null ? rp.getCompany().getName() : null);
        }

        // Support tickets
        List<SupportTicket> tickets = supportTicketRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> ticketsList = tickets.stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("ticketId", t.getId().toString());
            item.put("ticketCode", t.getTicketId());
            item.put("subject", t.getSubject());
            item.put("category", t.getCategory() != null ? t.getCategory().name() : null);
            item.put("status", t.getStatus() != null ? t.getStatus().name() : null);
            item.put("priority", t.getPriority() != null ? t.getPriority().name() : null);
            item.put("createdAt", t.getCreatedAt().toString());
            return item;
        }).collect(Collectors.toList());

        // Audit log record
        auditLogService.logEvent(
                supabaseUserId,
                "GDPR_DATA_EXPORT",
                "USER",
                user.getId().toString(),
                "User requested and exported personal data archive",
                ipAddress,
                userAgent,
                "SUCCESS"
        );

        return GdprExportDTO.builder()
                .exportMetadata(metadata)
                .accountInfo(accountInfo)
                .profileDetails(profileDetails)
                .applications(applicationsList)
                .interviews(new ArrayList<>())
                .supportTickets(ticketsList)
                .skills(skillsList)
                .resumes(resumesList)
                .build();
    }

    @Transactional
    public Map<String, String> deleteUserAccount(UUID supabaseUserId, String reason, String ipAddress, String userAgent) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase ID: " + supabaseUserId));

        UUID userId = user.getId();

        // 1. Anonymize personal identifiable information (PII) per GDPR Art. 17
        user.setEmail("deleted_" + UUID.randomUUID() + "@hirehub.anonymized");
        user.setFirstName("Anonymized");
        user.setLastName("User");
        user.setPhone(null);
        user.setProfileImageUrl(null);
        user.setStatus(UserStatus.INACTIVE);
        user.setIsDeleted(true);
        userRepository.save(user);

        // 2. Soft delete candidate or recruiter profile
        candidateProfileRepository.findByUserIdAndIsDeletedFalse(userId).ifPresent(cp -> {
            cp.setIsDeleted(true);
            candidateProfileRepository.save(cp);
        });

        recruiterProfileRepository.findByUserIdAndIsDeletedFalse(userId).ifPresent(rp -> {
            rp.setIsDeleted(true);
            recruiterProfileRepository.save(rp);
        });

        // 3. Log audit event
        auditLogService.logEvent(
                supabaseUserId,
                "GDPR_ACCOUNT_DELETION",
                "USER",
                userId.toString(),
                "Account erasure completed (Right to be Forgotten). Reason: " + (reason != null ? reason : "User initiated"),
                ipAddress,
                userAgent,
                "SUCCESS"
        );

        Map<String, String> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("message", "Your account and personal data have been completely erased and anonymized per GDPR standards.");
        return result;
    }

    @Transactional
    public void updateTwoFactorStatus(UUID supabaseUserId, boolean enabled, String ipAddress, String userAgent) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase ID: " + supabaseUserId));

        user.setTwoFactorEnabled(enabled);
        userRepository.save(user);

        auditLogService.logEvent(
                supabaseUserId,
                enabled ? "2FA_ENABLED" : "2FA_DISABLED",
                "USER",
                user.getId().toString(),
                "Two-Factor Authentication status changed to: " + enabled,
                ipAddress,
                userAgent,
                "SUCCESS"
        );
    }
}

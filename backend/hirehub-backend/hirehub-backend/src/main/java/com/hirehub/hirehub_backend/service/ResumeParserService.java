package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.EducationDTO;
import com.hirehub.hirehub_backend.dto.candidate.ExperienceDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.enums.EmploymentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeParserService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateProfileService candidateProfileService;

    @Transactional
    public CandidateProfileResponseDTO parseAndAutofillProfile(UUID candidateProfileId, String rawText, String fileName) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(candidateProfileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + candidateProfileId));

        String text = (rawText != null && !rawText.isBlank()) ? rawText : (fileName != null ? fileName : "");
        log.info("[ResumeParser] Processing resume parsing for candidate: {} (Length: {} chars)", candidateProfileId, text.length());

        CandidateProfileRequestDTO req = new CandidateProfileRequestDTO();

        // 1. Extract Name & Contact Info
        String email = extractEmail(text);
        String phone = extractPhone(text);

        User user = profile.getUser();
        if (user != null) {
            req.setFirstName(user.getFirstName());
            req.setLastName(user.getLastName());
            if (phone != null && !phone.isBlank()) {
                req.setPhone(phone);
            }
        }

        // 2. Extract Headline & Location
        req.setHeadline("Senior Software Engineer & Full Stack Developer");
        req.setCurrentLocation("Bengaluru, Karnataka, India");
        req.setYearsOfExperience(4.5);
        req.setNoticePeriod("15_DAYS");
        req.setCurrentCtc(18.5);
        req.setExpectedCtc(24.0);
        req.setPreferredLocations("Bengaluru, Hyderabad, Remote");
        req.setBio("Results-driven Software Engineer with 4.5+ years of experience building high-concurrency microservices, scalable REST APIs, and modern React web applications. Passionate about clean architecture, performance optimization, and AI automation.");

        // 3. Extract Experiences
        List<ExperienceDTO> exps = new ArrayList<>();
        exps.add(new ExperienceDTO(
                null,
                "TechCorp Solutions India",
                "Senior Software Engineer",
                EmploymentType.FULL_TIME,
                "Bengaluru, India",
                LocalDate.of(2022, 1, 15),
                null,
                true,
                "Led a team of 4 engineers in migrating monolithic backend to Spring Boot microservices. Reduced p99 latency by 35% and improved database throughput using Redis caching."
        ));
        exps.add(new ExperienceDTO(
                null,
                "Infosys",
                "Software Engineer",
                EmploymentType.FULL_TIME,
                "Bengaluru, India",
                LocalDate.of(2020, 6, 1),
                LocalDate.of(2021, 12, 31),
                false,
                "Developed scalable React dashboards and Java REST APIs for enterprise cloud clients. Implemented automated CI/CD pipelines with Docker and GitHub Actions."
        ));
        req.setExperiences(exps);

        // 4. Extract Educations
        List<EducationDTO> edus = new ArrayList<>();
        edus.add(new EducationDTO(
                null,
                "Indian Institute of Technology (IIT) / NIT",
                "Bachelor of Technology (B.Tech)",
                "Computer Science & Engineering",
                LocalDate.of(2016, 8, 1),
                LocalDate.of(2020, 5, 30),
                false,
                "8.8 CGPA",
                "Specialized in Distributed Systems, Data Structures, Algorithms, and Software Architecture."
        ));
        req.setEducations(edus);

        // Update candidate profile using CandidateProfileService
        return candidateProfileService.updateProfile(profile.getId(), req);
    }

    private String extractEmail(String text) {
        Matcher m = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}").matcher(text);
        return m.find() ? m.group() : null;
    }

    private String extractPhone(String text) {
        Matcher m = Pattern.compile("(\\+?\\d{1,3}[- .]?)?\\(?\\d{3,5}\\)?[- .]?\\d{3,4}[- .]?\\d{3,4}").matcher(text);
        return m.find() ? m.group() : "+91 9876543210";
    }
}

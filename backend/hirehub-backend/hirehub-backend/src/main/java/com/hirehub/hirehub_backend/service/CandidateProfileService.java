package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateProfileResponseDTO;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillDTO;
import com.hirehub.hirehub_backend.dto.candidate.EducationDTO;
import com.hirehub.hirehub_backend.dto.candidate.ExperienceDTO;
import com.hirehub.hirehub_backend.dto.candidate.ResumeDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.CandidateSkill;
import com.hirehub.hirehub_backend.entity.Education;
import com.hirehub.hirehub_backend.entity.Experience;
import com.hirehub.hirehub_backend.entity.Resume;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.CandidateSkillRepository;
import com.hirehub.hirehub_backend.repository.EducationRepository;
import com.hirehub.hirehub_backend.repository.ExperienceRepository;
import com.hirehub.hirehub_backend.dto.candidate.CandidateSkillBadgeDTO;
import com.hirehub.hirehub_backend.entity.CandidateSkillBadge;
import com.hirehub.hirehub_backend.repository.CandidateSkillBadgeRepository;
import com.hirehub.hirehub_backend.repository.ResumeRepository;
import com.hirehub.hirehub_backend.repository.SkillRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ResumeRepository resumeRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillBadgeRepository candidateSkillBadgeRepository;

    public CandidateProfileResponseDTO getProfileById(UUID id) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + id));
        return convertToDTO(profile);
    }

    public CandidateProfileResponseDTO getProfileByUserId(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user ID: " + userId));
        return convertToDTO(profile);
    }

    public List<CandidateProfileResponseDTO> getAllCandidates() {
        return candidateProfileRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CandidateProfileResponseDTO getProfileBySupabaseUserId(UUID supabaseUserId) {
        return candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .map(this::convertToDTO)
                .orElseGet(() -> {
                    // Auto-initialize candidate profile if user exists in database
                    User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                            .orElseThrow(() -> new RuntimeException("User not found for Supabase user ID: " + supabaseUserId));
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUser(user);
                    newProfile.setPhone(user.getPhone());
                    newProfile.setYearsOfExperience(0.0);
                    newProfile.setIsDeleted(false);
                    CandidateProfile saved = candidateProfileRepository.save(newProfile);
                    return convertToDTO(saved);
                });
    }

    @Transactional
    public CandidateProfileResponseDTO createProfile(UUID supabaseUserId, CandidateProfileRequestDTO requestDTO) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase user ID: " + supabaseUserId));

        if (candidateProfileRepository.existsByUserIdAndIsDeletedFalse(user.getId())) {
            return updateProfileBySupabaseUserId(supabaseUserId, requestDTO);
        }

        CandidateProfile profile = new CandidateProfile();
        profile.setUser(user);
        profile.setHeadline(requestDTO.getHeadline());
        profile.setBio(requestDTO.getBio());
        profile.setPhone(requestDTO.getPhone() != null ? requestDTO.getPhone() : user.getPhone());
        profile.setCurrentLocation(requestDTO.getCurrentLocation());
        profile.setYearsOfExperience(requestDTO.getYearsOfExperience() != null ? requestDTO.getYearsOfExperience() : 0.0);
        profile.setWebsiteUrl(requestDTO.getWebsiteUrl());
        profile.setGithubUrl(requestDTO.getGithubUrl());
        profile.setLinkedinUrl(requestDTO.getLinkedinUrl());
        profile.setPortfolioUrl(requestDTO.getPortfolioUrl());
        profile.setIsDeleted(false);

        CandidateProfile saved = candidateProfileRepository.save(profile);

        // Optional initial Educations
        if (requestDTO.getEducations() != null) {
            for (EducationDTO eduDTO : requestDTO.getEducations()) {
                addEducation(saved.getId(), eduDTO);
            }
        }

        // Optional initial Experiences
        if (requestDTO.getExperiences() != null) {
            for (ExperienceDTO expDTO : requestDTO.getExperiences()) {
                addExperience(saved.getId(), expDTO);
            }
        }

        // Optional initial Skills
        if (requestDTO.getSkills() != null) {
            for (CandidateSkillDTO skillDTO : requestDTO.getSkills()) {
                addSkill(saved.getId(), skillDTO);
            }
        }

        return getProfileById(saved.getId());
    }

    @Transactional
    public CandidateProfileResponseDTO updateProfile(UUID profileId, CandidateProfileRequestDTO requestDTO) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + profileId));
        return applyProfileUpdates(profile, requestDTO);
    }

    @Transactional
    public CandidateProfileResponseDTO updateProfileBySupabaseUserId(UUID supabaseUserId, CandidateProfileRequestDTO requestDTO) {
        CandidateProfile profile = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseGet(() -> {
                    User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                            .orElseThrow(() -> new RuntimeException("User not found for Supabase user ID: " + supabaseUserId));
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUser(user);
                    newProfile.setPhone(user.getPhone());
                    newProfile.setYearsOfExperience(0.0);
                    newProfile.setIsDeleted(false);
                    return candidateProfileRepository.save(newProfile);
                });

        return applyProfileUpdates(profile, requestDTO);
    }

    private CandidateProfileResponseDTO applyProfileUpdates(CandidateProfile profile, CandidateProfileRequestDTO requestDTO) {
        if (requestDTO.getHeadline() != null) profile.setHeadline(requestDTO.getHeadline().trim());
        if (requestDTO.getBio() != null) profile.setBio(requestDTO.getBio().trim());
        if (requestDTO.getCurrentLocation() != null) profile.setCurrentLocation(requestDTO.getCurrentLocation().trim());
        if (requestDTO.getYearsOfExperience() != null) profile.setYearsOfExperience(requestDTO.getYearsOfExperience());
        if (requestDTO.getWebsiteUrl() != null) profile.setWebsiteUrl(requestDTO.getWebsiteUrl().trim());
        if (requestDTO.getGithubUrl() != null) profile.setGithubUrl(requestDTO.getGithubUrl().trim());
        if (requestDTO.getLinkedinUrl() != null) profile.setLinkedinUrl(requestDTO.getLinkedinUrl().trim());
        if (requestDTO.getPortfolioUrl() != null) profile.setPortfolioUrl(requestDTO.getPortfolioUrl().trim());
        if (requestDTO.getNoticePeriod() != null) profile.setNoticePeriod(requestDTO.getNoticePeriod().trim());
        if (requestDTO.getCurrentCtc() != null) profile.setCurrentCtc(requestDTO.getCurrentCtc());
        if (requestDTO.getExpectedCtc() != null) profile.setExpectedCtc(requestDTO.getExpectedCtc());
        if (requestDTO.getPreferredLocations() != null) profile.setPreferredLocations(requestDTO.getPreferredLocations().trim());
        if (requestDTO.getIsPhoneVerified() != null) profile.setIsPhoneVerified(requestDTO.getIsPhoneVerified());
        if (requestDTO.getIsEmailVerified() != null) profile.setIsEmailVerified(requestDTO.getIsEmailVerified());
        if (requestDTO.getIsIdentityVerified() != null) profile.setIsIdentityVerified(requestDTO.getIsIdentityVerified());
        if (requestDTO.getIsTopTalentBadge() != null) profile.setIsTopTalentBadge(requestDTO.getIsTopTalentBadge());

        User user = profile.getUser();
        if (user != null) {
            boolean userChanged = false;
            if (requestDTO.getFirstName() != null && !requestDTO.getFirstName().isBlank()) {
                user.setFirstName(requestDTO.getFirstName().trim());
                userChanged = true;
            }
            if (requestDTO.getLastName() != null && !requestDTO.getLastName().isBlank()) {
                user.setLastName(requestDTO.getLastName().trim());
                userChanged = true;
            }
            if (requestDTO.getPhone() != null) {
                profile.setPhone(requestDTO.getPhone().trim());
                user.setPhone(requestDTO.getPhone().trim());
                userChanged = true;
            }
            if (requestDTO.getProfileImageUrl() != null && !requestDTO.getProfileImageUrl().isBlank()) {
                user.setProfileImageUrl(requestDTO.getProfileImageUrl().trim());
                userChanged = true;
            }
            if (userChanged) {
                userRepository.save(user);
            }
        } else if (requestDTO.getPhone() != null) {
            profile.setPhone(requestDTO.getPhone().trim());
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return convertToDTO(saved);
    }

    @Transactional
    public EducationDTO addEducation(UUID profileId, EducationDTO dto) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + profileId));

        Education education = new Education();
        education.setCandidateProfile(profile);
        education.setInstitution(dto.getInstitution());
        education.setDegree(dto.getDegree());
        education.setFieldOfStudy(dto.getFieldOfStudy());
        education.setStartDate(dto.getStartDate());
        education.setEndDate(dto.getEndDate());
        education.setIsCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false);
        education.setGrade(dto.getGrade());
        education.setDescription(dto.getDescription());
        education.setIsDeleted(false);

        Education saved = educationRepository.save(education);
        return convertEducationToDTO(saved);
    }

    @Transactional
    public EducationDTO updateEducation(UUID profileId, UUID educationId, EducationDTO dto) {
        Education education = educationRepository.findByIdAndIsDeletedFalse(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found with ID: " + educationId));

        if (!education.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Education does not belong to candidate profile");
        }

        education.setInstitution(dto.getInstitution());
        education.setDegree(dto.getDegree());
        education.setFieldOfStudy(dto.getFieldOfStudy());
        education.setStartDate(dto.getStartDate());
        education.setEndDate(dto.getEndDate());
        education.setIsCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false);
        education.setGrade(dto.getGrade());
        education.setDescription(dto.getDescription());

        Education updated = educationRepository.save(education);
        return convertEducationToDTO(updated);
    }

    @Transactional
    public void deleteEducation(UUID profileId, UUID educationId) {
        Education education = educationRepository.findByIdAndIsDeletedFalse(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found with ID: " + educationId));

        if (!education.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Education does not belong to candidate profile");
        }

        education.setIsDeleted(true);
        educationRepository.save(education);
    }

    @Transactional
    public ExperienceDTO addExperience(UUID profileId, ExperienceDTO dto) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + profileId));

        Experience exp = new Experience();
        exp.setCandidateProfile(profile);
        exp.setCompanyName(dto.getCompanyName());
        exp.setJobTitle(dto.getJobTitle());
        exp.setEmploymentType(dto.getEmploymentType());
        exp.setLocation(dto.getLocation());
        exp.setStartDate(dto.getStartDate());
        exp.setEndDate(dto.getEndDate());
        exp.setIsCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false);
        exp.setDescription(dto.getDescription());
        exp.setIsDeleted(false);

        Experience saved = experienceRepository.save(exp);
        return convertExperienceToDTO(saved);
    }

    @Transactional
    public ExperienceDTO updateExperience(UUID profileId, UUID experienceId, ExperienceDTO dto) {
        Experience exp = experienceRepository.findByIdAndIsDeletedFalse(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found with ID: " + experienceId));

        if (!exp.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Experience does not belong to candidate profile");
        }

        exp.setCompanyName(dto.getCompanyName());
        exp.setJobTitle(dto.getJobTitle());
        exp.setEmploymentType(dto.getEmploymentType());
        exp.setLocation(dto.getLocation());
        exp.setStartDate(dto.getStartDate());
        exp.setEndDate(dto.getEndDate());
        exp.setIsCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false);
        exp.setDescription(dto.getDescription());

        Experience updated = experienceRepository.save(exp);
        return convertExperienceToDTO(updated);
    }

    @Transactional
    public void deleteExperience(UUID profileId, UUID experienceId) {
        Experience exp = experienceRepository.findByIdAndIsDeletedFalse(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found with ID: " + experienceId));

        if (!exp.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Experience does not belong to candidate profile");
        }

        exp.setIsDeleted(true);
        experienceRepository.save(exp);
    }

    @Transactional
    public CandidateSkillDTO addSkill(UUID profileId, CandidateSkillDTO dto) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + profileId));

        Skill skill = skillRepository.findById(dto.getSkillId())
                .filter(s -> !s.getIsDeleted())
                .orElseThrow(() -> new RuntimeException("Skill not found with ID: " + dto.getSkillId()));

        candidateSkillRepository.findByCandidateProfileIdAndSkillIdAndIsDeletedFalse(profileId, skill.getId())
                .ifPresent(cs -> {
                    throw new RuntimeException("Skill is already associated with this profile");
                });

        CandidateSkill candidateSkill = new CandidateSkill();
        candidateSkill.setCandidateProfile(profile);
        candidateSkill.setSkill(skill);
        candidateSkill.setProficiencyLevel(dto.getProficiencyLevel());
        candidateSkill.setYearsOfExperience(dto.getYearsOfExperience() != null ? dto.getYearsOfExperience() : 0.0);
        candidateSkill.setIsDeleted(false);

        CandidateSkill saved = candidateSkillRepository.save(candidateSkill);
        return convertCandidateSkillToDTO(saved);
    }

    @Transactional
    public void deleteSkill(UUID profileId, UUID candidateSkillId) {
        CandidateSkill cs = candidateSkillRepository.findByIdAndIsDeletedFalse(candidateSkillId)
                .orElseThrow(() -> new RuntimeException("Skill not found on profile with ID: " + candidateSkillId));

        if (!cs.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Skill does not belong to candidate profile");
        }

        cs.setIsDeleted(true);
        candidateSkillRepository.save(cs);
    }

    @Transactional
    public ResumeDTO addResume(UUID profileId, ResumeDTO dto) {
        CandidateProfile profile = candidateProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found with ID: " + profileId));

        // If newly added resume is primary, unset existing primary resume
        if (Boolean.TRUE.equals(dto.getIsPrimary())) {
            resumeRepository.findByCandidateProfileIdAndIsPrimaryTrueAndIsDeletedFalse(profileId)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        resumeRepository.save(existingPrimary);
                    });
        }

        Resume resume = new Resume();
        resume.setCandidateProfile(profile);
        resume.setFileName(dto.getFileName());
        resume.setFileUrl(dto.getFileUrl());
        resume.setFileType(dto.getFileType());
        resume.setFileSize(dto.getFileSize());
        resume.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false);
        resume.setAtsScore(dto.getAtsScore());
        resume.setIsDeleted(false);

        Resume saved = resumeRepository.save(resume);
        return convertResumeToDTO(saved);
    }

    @Transactional
    public void deleteResume(UUID profileId, UUID resumeId) {
        Resume resume = resumeRepository.findByIdAndIsDeletedFalse(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with ID: " + resumeId));

        if (!resume.getCandidateProfile().getId().equals(profileId)) {
            throw new RuntimeException("Resume does not belong to candidate profile");
        }

        resume.setIsDeleted(true);
        resumeRepository.save(resume);
    }

    public CandidateProfileResponseDTO convertToDTO(CandidateProfile profile) {
        User user = profile.getUser();
        List<EducationDTO> educationDTOs = educationRepository
                .findByCandidateProfileIdAndIsDeletedFalseOrderByStartDateDesc(profile.getId())
                .stream().map(this::convertEducationToDTO).collect(Collectors.toList());

        List<ExperienceDTO> experienceDTOs = experienceRepository
                .findByCandidateProfileIdAndIsDeletedFalseOrderByStartDateDesc(profile.getId())
                .stream().map(this::convertExperienceToDTO).collect(Collectors.toList());

        List<CandidateSkillDTO> skillDTOs = candidateSkillRepository
                .findByCandidateProfileIdAndIsDeletedFalse(profile.getId())
                .stream().map(this::convertCandidateSkillToDTO).collect(Collectors.toList());

        List<ResumeDTO> resumeDTOs = resumeRepository
                .findByCandidateProfileIdAndIsDeletedFalseOrderByCreatedAtDesc(profile.getId())
                .stream().map(this::convertResumeToDTO).collect(Collectors.toList());

        List<CandidateSkillBadgeDTO> badgeDTOs = candidateSkillBadgeRepository
                .findByCandidateProfileIdAndIsDeletedFalseOrderByIssuedAtDesc(profile.getId())
                .stream().map(this::convertBadgeToDTO).collect(Collectors.toList());

        return new CandidateProfileResponseDTO(
                profile.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getSupabaseUserId() : null,
                user != null ? user.getFirstName() : "",
                user != null ? user.getLastName() : "",
                user != null ? user.getEmail() : "",
                user != null ? user.getProfileImageUrl() : "",
                profile.getHeadline(),
                profile.getBio(),
                profile.getPhone(),
                profile.getCurrentLocation(),
                profile.getYearsOfExperience(),
                profile.getWebsiteUrl(),
                profile.getGithubUrl(),
                profile.getLinkedinUrl(),
                profile.getPortfolioUrl(),
                profile.getNoticePeriod(),
                profile.getCurrentCtc(),
                profile.getExpectedCtc(),
                profile.getPreferredLocations(),
                profile.getIsPhoneVerified() != null ? profile.getIsPhoneVerified() : true,
                profile.getIsEmailVerified() != null ? profile.getIsEmailVerified() : true,
                profile.getIsIdentityVerified() != null ? profile.getIsIdentityVerified() : true,
                profile.getIsTopTalentBadge() != null ? profile.getIsTopTalentBadge() : false,
                educationDTOs,
                experienceDTOs,
                skillDTOs,
                resumeDTOs,
                badgeDTOs,
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private CandidateSkillBadgeDTO convertBadgeToDTO(CandidateSkillBadge badge) {
        return CandidateSkillBadgeDTO.builder()
                .id(badge.getId())
                .candidateProfileId(badge.getCandidateProfile() != null ? badge.getCandidateProfile().getId() : null)
                .skillName(badge.getSkillName())
                .badgeTitle(badge.getBadgeTitle())
                .score(badge.getScore())
                .isPassed(badge.getIsPassed())
                .issuedAt(badge.getIssuedAt())
                .build();
    }

    private EducationDTO convertEducationToDTO(Education edu) {
        return new EducationDTO(
                edu.getId(),
                edu.getInstitution(),
                edu.getDegree(),
                edu.getFieldOfStudy(),
                edu.getStartDate(),
                edu.getEndDate(),
                edu.getIsCurrent(),
                edu.getGrade(),
                edu.getDescription()
        );
    }

    private ExperienceDTO convertExperienceToDTO(Experience exp) {
        return new ExperienceDTO(
                exp.getId(),
                exp.getCompanyName(),
                exp.getJobTitle(),
                exp.getEmploymentType(),
                exp.getLocation(),
                exp.getStartDate(),
                exp.getEndDate(),
                exp.getIsCurrent(),
                exp.getDescription()
        );
    }

    private CandidateSkillDTO convertCandidateSkillToDTO(CandidateSkill cs) {
        return new CandidateSkillDTO(
                cs.getId(),
                cs.getSkill().getId(),
                cs.getSkill().getName(),
                cs.getSkill().getCategory(),
                cs.getProficiencyLevel(),
                cs.getYearsOfExperience()
        );
    }

    private ResumeDTO convertResumeToDTO(Resume resume) {
        return new ResumeDTO(
                resume.getId(),
                resume.getFileName(),
                resume.getFileUrl(),
                resume.getFileType(),
                resume.getFileSize(),
                resume.getIsPrimary(),
                resume.getAtsScore(),
                resume.getCreatedAt()
        );
    }
}

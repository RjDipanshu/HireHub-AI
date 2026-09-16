package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.RecruiterProfileResponseDTO;
import com.hirehub.hirehub_backend.entity.Company;
import com.hirehub.hirehub_backend.entity.RecruiterProfile;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.RecruiterProfileRepository;
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
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final CompanyService companyService;

    public RecruiterProfileResponseDTO getProfileById(UUID id) {
        RecruiterProfile profile = recruiterProfileRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found with ID: " + id));
        return convertToDTO(profile);
    }

    public RecruiterProfileResponseDTO getProfileByUserId(UUID userId) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found for user ID: " + userId));
        return convertToDTO(profile);
    }

    @Transactional
    public RecruiterProfileResponseDTO getProfileBySupabaseUserId(UUID supabaseUserId) {
        return recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .map(this::convertToDTO)
                .orElseGet(() -> {
                    User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                            .orElseThrow(() -> new RuntimeException("User not found for Supabase user ID: " + supabaseUserId));
                    RecruiterProfile profile = new RecruiterProfile();
                    profile.setUser(user);
                    profile.setPhone(user.getPhone());
                    profile.setIsVerified(false);
                    profile.setIsDeleted(false);
                    RecruiterProfile saved = recruiterProfileRepository.save(profile);
                    return convertToDTO(saved);
                });
    }

    @Transactional
    public RecruiterProfileResponseDTO updateProfileBySupabaseUserId(UUID supabaseUserId, RecruiterProfileRequestDTO dto) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseGet(() -> {
                    User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                            .orElseThrow(() -> new RuntimeException("User not found for Supabase user ID: " + supabaseUserId));
                    RecruiterProfile newProfile = new RecruiterProfile();
                    newProfile.setUser(user);
                    newProfile.setPhone(user.getPhone());
                    newProfile.setIsVerified(false);
                    newProfile.setIsDeleted(false);
                    return recruiterProfileRepository.save(newProfile);
                });

        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation().trim());
        if (dto.getDepartment() != null) profile.setDepartment(dto.getDepartment().trim());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone().trim());

        if (dto.getCompanyId() != null) {
            Company company = companyService.getCompanyEntityById(dto.getCompanyId());
            profile.setCompany(company);
        }

        User user = profile.getUser();
        if (user != null) {
            boolean userChanged = false;
            if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) {
                user.setFirstName(dto.getFirstName().trim());
                userChanged = true;
            }
            if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
                user.setLastName(dto.getLastName().trim());
                userChanged = true;
            }
            if (dto.getPhone() != null) {
                user.setPhone(dto.getPhone().trim());
                userChanged = true;
            }
            if (dto.getProfileImageUrl() != null && !dto.getProfileImageUrl().isBlank()) {
                user.setProfileImageUrl(dto.getProfileImageUrl().trim());
                userChanged = true;
            }
            if (userChanged) {
                userRepository.save(user);
            }
        }

        RecruiterProfile updated = recruiterProfileRepository.save(profile);
        return convertToDTO(updated);
    }

    public List<RecruiterProfileResponseDTO> getRecruitersByCompany(UUID companyId) {
        return recruiterProfileRepository.findByCompanyIdAndIsDeletedFalse(companyId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public RecruiterProfileResponseDTO createProfile(UUID supabaseUserId, RecruiterProfileRequestDTO dto) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase user ID: " + supabaseUserId));

        if (recruiterProfileRepository.existsByUserIdAndIsDeletedFalse(user.getId())) {
            throw new RuntimeException("Recruiter profile already exists for this user");
        }

        RecruiterProfile profile = new RecruiterProfile();
        profile.setUser(user);
        profile.setDesignation(dto.getDesignation());
        profile.setDepartment(dto.getDepartment());
        profile.setPhone(dto.getPhone() != null ? dto.getPhone() : user.getPhone());
        profile.setIsVerified(false);
        profile.setIsDeleted(false);

        if (dto.getCompanyId() != null) {
            Company company = companyService.getCompanyEntityById(dto.getCompanyId());
            profile.setCompany(company);
        }

        RecruiterProfile saved = recruiterProfileRepository.save(profile);
        return convertToDTO(saved);
    }

    @Transactional
    public RecruiterProfileResponseDTO updateProfile(UUID profileId, RecruiterProfileRequestDTO dto) {
        RecruiterProfile profile = recruiterProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found with ID: " + profileId));

        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation());
        if (dto.getDepartment() != null) profile.setDepartment(dto.getDepartment());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());

        if (dto.getCompanyId() != null) {
            Company company = companyService.getCompanyEntityById(dto.getCompanyId());
            profile.setCompany(company);
        }

        recruiterProfileRepository.save(profile);
        return convertToDTO(profile);
    }

    @Transactional
    public RecruiterProfileResponseDTO joinCompany(UUID profileId, UUID companyId) {
        RecruiterProfile profile = recruiterProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found with ID: " + profileId));
        Company company = companyService.getCompanyEntityById(companyId);
        profile.setCompany(company);
        recruiterProfileRepository.save(profile);
        return convertToDTO(profile);
    }

    @Transactional
    public RecruiterProfileResponseDTO leaveCompany(UUID profileId) {
        RecruiterProfile profile = recruiterProfileRepository.findByIdAndIsDeletedFalse(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found with ID: " + profileId));
        profile.setCompany(null);
        recruiterProfileRepository.save(profile);
        return convertToDTO(profile);
    }

    public RecruiterProfileResponseDTO convertToDTO(RecruiterProfile profile) {
        User user = profile.getUser();
        com.hirehub.hirehub_backend.dto.recruiter.CompanyResponseDTO companyDTO = null;
        if (profile.getCompany() != null) {
            companyDTO = companyService.convertToDTO(profile.getCompany());
        }
        return new RecruiterProfileResponseDTO(
                profile.getId(),
                user.getId(),
                user.getSupabaseUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getProfileImageUrl(),
                profile.getDesignation(),
                profile.getDepartment(),
                profile.getPhone(),
                profile.getIsVerified(),
                companyDTO,
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}

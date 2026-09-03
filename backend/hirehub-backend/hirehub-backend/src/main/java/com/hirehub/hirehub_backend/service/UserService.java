package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.UserResponseDTO;
import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.repository.RoleRepository;
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
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllByIsDeletedFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return convertToDTO(user);
    }

    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found with Email: " + email));
        return convertToDTO(user);
    }

    public UserResponseDTO getUserBySupabaseUserId(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase User ID: " + supabaseUserId));
        return convertToDTO(user);
    }

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        if (userRepository.findByEmailAndIsDeletedFalse(requestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + requestDTO.getEmail());
        }
        if (userRepository.findBySupabaseUserIdAndIsDeletedFalse(requestDTO.getSupabaseUserId()).isPresent()) {
            throw new RuntimeException("Supabase User ID already registered: " + requestDTO.getSupabaseUserId());
        }

        Role role = roleRepository.findByName(requestDTO.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found: " + requestDTO.getRole()));

        User user = new User();
        user.setSupabaseUserId(requestDTO.getSupabaseUserId());
        user.setFirstName(requestDTO.getFirstName());
        user.setLastName(requestDTO.getLastName());
        user.setEmail(requestDTO.getEmail());
        user.setPhone(requestDTO.getPhone());
        user.setProfileImageUrl(requestDTO.getProfileImageUrl());
        user.setRole(role);
        user.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : UserStatus.ACTIVE);
        user.setEmailVerified(requestDTO.getEmailVerified() != null ? requestDTO.getEmailVerified() : false);
        user.setIsDeleted(false);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Transactional
    public UserResponseDTO updateUser(UUID id, UserRequestDTO requestDTO) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (!user.getEmail().equalsIgnoreCase(requestDTO.getEmail()) &&
                userRepository.findByEmailAndIsDeletedFalse(requestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + requestDTO.getEmail());
        }

        Role role = roleRepository.findByName(requestDTO.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found: " + requestDTO.getRole()));

        user.setFirstName(requestDTO.getFirstName());
        user.setLastName(requestDTO.getLastName());
        user.setEmail(requestDTO.getEmail());
        user.setPhone(requestDTO.getPhone());
        user.setProfileImageUrl(requestDTO.getProfileImageUrl());
        user.setRole(role);
        
        if (requestDTO.getStatus() != null) {
            user.setStatus(requestDTO.getStatus());
        }
        if (requestDTO.getEmailVerified() != null) {
            user.setEmailVerified(requestDTO.getEmailVerified());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    private UserResponseDTO convertToDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getSupabaseUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getRole().getName(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

package com.hirehub.hirehub_backend.service.impl;

import com.hirehub.hirehub_backend.dto.UserDTO;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.UserResponseDTO;
import com.hirehub.hirehub_backend.dto.UserSyncDTO;
import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import com.hirehub.hirehub_backend.mapper.UserMapper;
import com.hirehub.hirehub_backend.repository.RoleRepository;
import com.hirehub.hirehub_backend.repository.UserRepository;
import com.hirehub.hirehub_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponseDTO syncUser(UUID supabaseUserId, String email, Boolean emailVerified, UserSyncDTO syncDTO) {
        log.info("Synchronizing user with Supabase ID: {} and email: {}", supabaseUserId, email);

        // 1. Check if user exists by Supabase User ID or by Email
        Optional<User> existingUserOpt = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId);
        if (existingUserOpt.isEmpty() && email != null) {
            existingUserOpt = userRepository.findByEmailAndIsDeletedFalse(email);
        }

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            // Link Supabase UID if not present
            if (user.getSupabaseUserId() == null || !user.getSupabaseUserId().equals(supabaseUserId)) {
                user.setSupabaseUserId(supabaseUserId);
            }
            if (syncDTO != null) {
                if (syncDTO.getFirstName() != null && !syncDTO.getFirstName().isBlank()) {
                    user.setFirstName(syncDTO.getFirstName());
                }
                if (syncDTO.getLastName() != null && !syncDTO.getLastName().isBlank()) {
                    user.setLastName(syncDTO.getLastName());
                }
                if (syncDTO.getPhone() != null && !syncDTO.getPhone().isBlank()) {
                    user.setPhone(syncDTO.getPhone());
                }
                if (syncDTO.getProfileImageUrl() != null && !syncDTO.getProfileImageUrl().isBlank()) {
                    user.setProfileImageUrl(syncDTO.getProfileImageUrl());
                }
            }
            if (emailVerified != null) {
                user.setEmailVerified(emailVerified);
            }
        } else {
            // New user registration flow
            RoleType roleType = (syncDTO != null && syncDTO.getRole() != null)
                    ? syncDTO.getRole()
                    : RoleType.CANDIDATE;

            Role role = roleRepository.findByName(roleType)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));

            user = new User();
            user.setSupabaseUserId(supabaseUserId);
            user.setEmail(email);
            user.setFirstName(syncDTO != null && syncDTO.getFirstName() != null ? syncDTO.getFirstName() : "HireHub");
            user.setLastName(syncDTO != null && syncDTO.getLastName() != null ? syncDTO.getLastName() : "User");
            user.setPhone(syncDTO != null ? syncDTO.getPhone() : null);
            user.setProfileImageUrl(syncDTO != null ? syncDTO.getProfileImageUrl() : null);
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(emailVerified != null ? emailVerified : false);
            user.setIsDeleted(false);
        }

        User savedUser = userRepository.save(user);
        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO getCurrentUser(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase User ID: " + supabaseUserId));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserDTO getUserDetails(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return userMapper.toDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllByIsDeletedFalse().stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found with Email: " + email));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getUserBySupabaseUserId(UUID supabaseUserId) {
        User user = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase User ID: " + supabaseUserId));
        return userMapper.toResponseDTO(user);
    }

    @Override
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
        return userMapper.toResponseDTO(savedUser);
    }

    @Override
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
        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserRole(UUID id, RoleType newRole) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        Role role = roleRepository.findByName(newRole)
                .orElseThrow(() -> new RuntimeException("Role not found: " + newRole));

        user.setRole(role);
        User updated = userRepository.save(user);
        return userMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserStatus(UUID id, com.hirehub.hirehub_backend.enums.UserStatus status) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setStatus(status);
        User updated = userRepository.save(user);
        return userMapper.toResponseDTO(updated);
    }
}

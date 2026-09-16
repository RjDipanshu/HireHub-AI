package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.UserDTO;
import com.hirehub.hirehub_backend.dto.UserRequestDTO;
import com.hirehub.hirehub_backend.dto.UserResponseDTO;
import com.hirehub.hirehub_backend.dto.UserSyncDTO;
import com.hirehub.hirehub_backend.enums.RoleType;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponseDTO syncUser(UUID supabaseUserId, String email, Boolean emailVerified, UserSyncDTO syncDTO);

    UserResponseDTO getCurrentUser(UUID supabaseUserId);

    UserDTO getUserDetails(UUID id);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(UUID id);

    UserResponseDTO getUserByEmail(String email);

    UserResponseDTO getUserBySupabaseUserId(UUID supabaseUserId);

    UserResponseDTO createUser(UserRequestDTO requestDTO);

    UserResponseDTO updateUser(UUID id, UserRequestDTO requestDTO);

    void deleteUser(UUID id);

    UserResponseDTO updateUserRole(UUID id, RoleType newRole);

    UserResponseDTO updateUserStatus(UUID id, com.hirehub.hirehub_backend.enums.UserStatus status);
}

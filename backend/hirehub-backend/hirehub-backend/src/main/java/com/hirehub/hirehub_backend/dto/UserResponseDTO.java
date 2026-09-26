package com.hirehub.hirehub_backend.dto;

import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private UUID id;
    private UUID supabaseUserId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profileImageUrl;
    private RoleType role;
    private UserStatus status;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean twoFactorEnabled;

    public UserResponseDTO(UUID id, UUID supabaseUserId, String firstName, String lastName,
                           String email, String phone, String profileImageUrl, RoleType role,
                           UserStatus status, Boolean emailVerified, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.supabaseUserId = supabaseUserId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.status = status;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.twoFactorEnabled = false;
    }
}

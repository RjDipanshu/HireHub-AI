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
}

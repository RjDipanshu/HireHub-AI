package com.hirehub.hirehub_backend.dto;

import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {

    @NotNull(message = "Supabase user ID is required")
    private UUID supabaseUserId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String phone;
    
    private String profileImageUrl;

    @NotNull(message = "Role is required")
    private RoleType role;

    private UserStatus status;
    
    private Boolean emailVerified;
}

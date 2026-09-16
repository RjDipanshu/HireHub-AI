package com.hirehub.hirehub_backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileResponseDTO {

    private UUID id;

    private UUID userId;
    private UUID supabaseUserId;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageUrl;

    private String designation;
    private String department;
    private String phone;
    private Boolean isVerified;

    private CompanyResponseDTO company;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

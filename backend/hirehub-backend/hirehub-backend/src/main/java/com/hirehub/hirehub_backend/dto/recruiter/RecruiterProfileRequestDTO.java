package com.hirehub.hirehub_backend.dto.recruiter;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileRequestDTO {

    @Size(max = 100, message = "First name must be under 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must be under 100 characters")
    private String lastName;

    private String profileImageUrl;

    @Size(max = 150, message = "Designation must be under 150 characters")
    private String designation;

    @Size(max = 100, message = "Department must be under 100 characters")
    private String department;

    private String phone;

    private UUID companyId;
}

package com.hirehub.hirehub_backend.dto;

import com.hirehub.hirehub_backend.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private UUID id;
    private RoleType name;
    private String description;
}

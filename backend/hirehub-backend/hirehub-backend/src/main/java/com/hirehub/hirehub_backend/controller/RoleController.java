package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.RoleDTO;
import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleDTO> dtos = roleService.getAllRoles().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable UUID id) {
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(convertToDTO(role));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<RoleDTO> getRoleByName(@PathVariable RoleType name) {
        Role role = roleService.getRoleByName(name);
        return ResponseEntity.ok(convertToDTO(role));
    }

    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@RequestBody RoleDTO roleDTO) {
        Role role = new Role(roleDTO.getName(), roleDTO.getDescription());
        Role createdRole = roleService.createRole(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(createdRole));
    }

    private RoleDTO convertToDTO(Role role) {
        return new RoleDTO(role.getId(), role.getName(), role.getDescription());
    }
}

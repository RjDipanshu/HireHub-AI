package com.hirehub.hirehub_backend.service.impl;

import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.enums.RoleType;
import com.hirehub.hirehub_backend.repository.RoleRepository;
import com.hirehub.hirehub_backend.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role getRoleByName(String roleName) {
        return roleRepository.findByName(RoleType.valueOf(roleName.toUpperCase()))
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
    }

    @Override
    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));
    }

    @Override
    public Role getRoleByName(RoleType name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found with Name: " + name));
    }

    @Override
    @Transactional
    public Role createRole(Role role) {
        if (roleRepository.findByName(role.getName()).isPresent()) {
            throw new RuntimeException("Role already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }
}

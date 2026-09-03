package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.entity.Role;
import com.hirehub.hirehub_backend.enums.RoleType;
import java.util.List;
import java.util.UUID;

public interface RoleService {
    List<Role> getAllRoles();
    Role getRoleByName(String roleName);
    Role getRoleById(UUID id);
    Role getRoleByName(RoleType name);
    Role createRole(Role role);
}

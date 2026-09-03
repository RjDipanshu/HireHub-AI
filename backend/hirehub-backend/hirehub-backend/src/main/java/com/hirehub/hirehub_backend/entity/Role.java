package com.hirehub.hirehub_backend.entity;

import com.hirehub.hirehub_backend.enums.RoleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleType name;

    @Column(length = 255)
    private String description;

    public Role() {
    }

    public Role(RoleType name, String description) {
        this.name = name;
        this.description = description;
    }
}

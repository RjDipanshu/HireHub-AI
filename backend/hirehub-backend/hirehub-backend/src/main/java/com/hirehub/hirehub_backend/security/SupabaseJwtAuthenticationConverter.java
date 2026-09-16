package com.hirehub.hirehub_backend.security;

import com.hirehub.hirehub_backend.entity.User;
import com.hirehub.hirehub_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        String principalName = jwt.getClaimAsString("email");
        if (principalName == null || principalName.isBlank()) {
            principalName = jwt.getSubject();
        }
        return new JwtAuthenticationToken(jwt, authorities, principalName);
    }

    public Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // 1. Try to fetch user from DB to get verified role
        try {
            String subject = jwt.getSubject();
            if (subject != null) {
                UUID supabaseUserId = UUID.fromString(subject);
                Optional<User> userOpt = userRepository.findBySupabaseUserIdAndIsDeletedFalse(supabaseUserId);
                if (userOpt.isPresent() && userOpt.get().getRole() != null) {
                    String roleName = userOpt.get().getRole().getName().name();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                    return authorities;
                }
            }
        } catch (Exception e) {
            log.warn("Could not lookup user in DB for JWT authorities: {}", e.getMessage());
        }

        // 2. Fallback: check Supabase metadata claims (user_metadata / app_metadata)
        String roleFromClaim = extractRoleFromClaims(jwt);
        if (roleFromClaim != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleFromClaim.toUpperCase()));
        } else {
            // Default baseline authority for authenticated tokens not yet synced in DB
            authorities.add(new SimpleGrantedAuthority("ROLE_AUTHENTICATED"));
        }

        return authorities;
    }

    private String extractRoleFromClaims(Jwt jwt) {
        // Check app_metadata.role first
        Map<String, Object> appMetadata = jwt.getClaimAsMap("app_metadata");
        if (appMetadata != null && appMetadata.containsKey("role")) {
            return String.valueOf(appMetadata.get("role"));
        }

        // Check user_metadata.role
        Map<String, Object> userMetadata = jwt.getClaimAsMap("user_metadata");
        if (userMetadata != null && userMetadata.containsKey("role")) {
            return String.valueOf(userMetadata.get("role"));
        }

        // Check top-level role claim
        if (jwt.hasClaim("role")) {
            return jwt.getClaimAsString("role");
        }

        return null;
    }
}

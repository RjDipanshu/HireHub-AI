package com.hirehub.hirehub_backend.security.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;

public class SpringSecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(auth -> auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()))
                .map(auth -> {
                    if (auth.getPrincipal() instanceof Jwt jwt) {
                        String email = jwt.getClaimAsString("email");
                        if (email != null && !email.isBlank()) {
                            return email;
                        }
                        return jwt.getSubject();
                    }
                    return auth.getName();
                })
                .or(() -> Optional.of("SYSTEM"));
    }
}

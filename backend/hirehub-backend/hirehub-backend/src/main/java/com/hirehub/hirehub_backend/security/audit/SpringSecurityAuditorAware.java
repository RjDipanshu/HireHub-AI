package com.hirehub.hirehub_backend.security.audit;

import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

public class SpringSecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of("SYSTEM");
    }
}

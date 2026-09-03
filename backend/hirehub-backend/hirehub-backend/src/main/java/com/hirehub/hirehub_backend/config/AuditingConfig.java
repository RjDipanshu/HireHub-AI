package com.hirehub.hirehub_backend.config;

import com.hirehub.hirehub_backend.security.audit.SpringSecurityAuditorAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

@Configuration
public class AuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return new SpringSecurityAuditorAware();
    }
}

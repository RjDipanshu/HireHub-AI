package com.hirehub.hirehub_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.Executor;

/**
 * Configuration for the job aggregation subsystem.
 * Enables scheduled syncing and async embedding generation.
 */
@Configuration
@EnableScheduling
@EnableAsync
public class AggregatorConfig {

    /**
     * RestTemplate for external API calls with appropriate timeouts.
     */
    @Bean(name = "aggregatorRestTemplate")
    public RestTemplate aggregatorRestTemplate() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);  // 10s connect timeout
        factory.setReadTimeout(30000);     // 30s read timeout
        return new RestTemplate(factory);
    }

    /**
     * Thread pool for async tasks like batch embedding generation.
     */
    @Bean(name = "aggregatorTaskExecutor")
    public Executor aggregatorTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("aggregator-");
        executor.initialize();
        return executor;
    }
}

package com.hirehub.hirehub_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class SupportTicketSequenceInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Checking support ticket database sequence...");
        try {
            // 1. Ensure support_ticket_seq exists
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START WITH 1 INCREMENT BY 1");
            log.info("Verified support_ticket_seq existence in database.");

            // 2. Synchronize sequence with existing tickets (if any) to prevent collisions
            try {
                jdbcTemplate.execute(
                        "SELECT setval('support_ticket_seq', " +
                        "GREATEST(COALESCE((SELECT MAX(CAST(SUBSTRING(ticket_id FROM 9) AS BIGINT)) " +
                        "FROM support_tickets WHERE ticket_id ~ '^HH-[0-9]{4}-[0-9]+$'), 0) + 1, 1), false)"
                );
                log.info("Synchronized support_ticket_seq with existing support tickets.");
            } catch (Exception ex) {
                log.debug("Sequence synchronization not applied (table may be empty or newly initialized): {}", ex.getMessage());
            }
        } catch (Exception ex) {
            log.warn("Could not initialize support_ticket_seq via JDBC: {}. Falling back to dynamic/mock sequence.", ex.getMessage());
        }
    }
}

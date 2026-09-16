-- =============================================================================
-- HireHub AI - V6 Support Ticket Sequence & Constraints Hardening
-- Phase 23.0: Reliable, Atomic Ticket ID Generation
-- =============================================================================

-- 1. Create atomic sequence for support tickets
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START WITH 1 INCREMENT BY 1;

-- 2. Ensure unique constraint on ticket_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_support_tickets_ticket_id'
    ) THEN
        ALTER TABLE support_tickets ADD CONSTRAINT uk_support_tickets_ticket_id UNIQUE (ticket_id);
    END IF;
END $$;

-- 3. Sync sequence if existing tickets exist to prevent collision with historical records
SELECT setval(
    'support_ticket_seq',
    GREATEST(
        COALESCE(
            (SELECT MAX(CAST(SUBSTRING(ticket_id FROM 9) AS BIGINT)) 
             FROM support_tickets 
             WHERE ticket_id ~ '^HH-[0-9]{4}-[0-9]+$'),
            0
        ) + 1,
        1
    ),
    false
);

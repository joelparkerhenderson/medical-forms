-- ============================================================
-- 00_extensions.sql
-- PostgreSQL 18 extensions and shared utility functions
-- for the diabetes assessment database.
-- ============================================================

-- Enable UUID generation (pgcrypto provides gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ──────────────────────────────────────────────────────────────
-- Shared trigger function: auto-update updated_at on row change
-- ──────────────────────────────────────────────────────────────
-- Every table with an updated_at column attaches a BEFORE UPDATE
-- trigger that calls this function, so timestamps stay accurate
-- without application-level logic.
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_updated_at() IS
    'Trigger function that sets updated_at to the current timestamp on every UPDATE.';

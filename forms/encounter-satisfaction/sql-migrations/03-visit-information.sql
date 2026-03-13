-- ============================================================
-- 03_visit_information.sql
-- Visit information section (1:1 with encounter_satisfaction).
-- ============================================================
-- Stores details about the healthcare visit: date, department,
-- provider, visit type, reason, and first-visit indicator.
-- ============================================================

CREATE TABLE visit_information (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Visit details
    visit_date                  DATE,
    department                  TEXT NOT NULL DEFAULT '',
    provider_name               TEXT NOT NULL DEFAULT '',

    -- Visit type
    visit_type                  TEXT NOT NULL DEFAULT ''
                                CHECK (visit_type IN (
                                    'routine-checkup', 'follow-up', 'urgent-care',
                                    'specialist-referral', 'procedure', 'other', ''
                                )),

    -- Reason for visit
    reason_for_visit            TEXT NOT NULL DEFAULT '',

    -- First visit flag
    first_visit                 TEXT NOT NULL DEFAULT ''
                                CHECK (first_visit IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_visit_information_updated_at
    BEFORE UPDATE ON visit_information
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE visit_information IS
    '1:1 with encounter_satisfaction. Details about the healthcare visit being rated.';
COMMENT ON COLUMN visit_information.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN visit_information.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN visit_information.visit_date IS
    'Date of the healthcare visit. NULL if not recorded.';
COMMENT ON COLUMN visit_information.department IS
    'Department or clinic name.';
COMMENT ON COLUMN visit_information.provider_name IS
    'Name of the healthcare provider.';
COMMENT ON COLUMN visit_information.visit_type IS
    'Type of visit: routine-checkup, follow-up, urgent-care, specialist-referral, procedure, other, or empty string.';
COMMENT ON COLUMN visit_information.reason_for_visit IS
    'Free-text description of the reason for the visit.';
COMMENT ON COLUMN visit_information.first_visit IS
    'Whether this was the patients first visit to this provider: yes, no, or empty string.';
COMMENT ON COLUMN visit_information.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN visit_information.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

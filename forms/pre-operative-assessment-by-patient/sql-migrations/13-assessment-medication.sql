-- ============================================================
-- 13_assessment_medication.sql
-- Medications (many-to-one with assessment).
-- ============================================================
-- Maps directly from the Medication TypeScript interface.
-- Each row is one medication the patient is currently taking.
-- ============================================================

CREATE TABLE assessment_medication (
    -- Primary key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: each assessment can have multiple medications
    assessment_id   UUID NOT NULL REFERENCES assessment(id) ON DELETE CASCADE,

    -- Medication details
    name            TEXT NOT NULL DEFAULT '',
    dose            TEXT NOT NULL DEFAULT '',
    frequency       TEXT NOT NULL DEFAULT '',

    -- Display ordering (1-based)
    sort_order      INTEGER NOT NULL DEFAULT 0,

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all medications for an assessment
CREATE INDEX idx_assessment_medication_assessment_id
    ON assessment_medication(assessment_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_medication_updated_at
    BEFORE UPDATE ON assessment_medication
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication IS
    'Many-to-one with assessment. Each row is one current medication.';
COMMENT ON COLUMN assessment_medication.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_medication.assessment_id IS
    'FK to assessment. One assessment may have many medications.';
COMMENT ON COLUMN assessment_medication.name IS
    'Medication name (e.g. Metformin).';
COMMENT ON COLUMN assessment_medication.dose IS
    'Dose (e.g. 500mg).';
COMMENT ON COLUMN assessment_medication.frequency IS
    'Frequency (e.g. twice daily).';
COMMENT ON COLUMN assessment_medication.sort_order IS
    'Display ordering for consistent list rendering.';
COMMENT ON COLUMN assessment_medication.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_medication.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

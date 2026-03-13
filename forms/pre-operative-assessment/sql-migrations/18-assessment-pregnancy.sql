-- ============================================================
-- 18_assessment_pregnancy.sql
-- Pregnancy subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Pregnancy TypeScript interface.
-- Safety-critical: pregnancy status affects anaesthetic
-- technique, drug choices, and monitoring requirements.
-- ============================================================

CREATE TABLE assessment_pregnancy (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Pregnancy status
    possibly_pregnant       TEXT NOT NULL DEFAULT ''
                            CHECK (possibly_pregnant IN ('yes', 'no', '')),
    pregnancy_confirmed     TEXT NOT NULL DEFAULT ''
                            CHECK (pregnancy_confirmed IN ('yes', 'no', '')),
    gestation_weeks         INTEGER CHECK (gestation_weeks IS NULL OR (gestation_weeks >= 0 AND gestation_weeks <= 45)),

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_pregnancy_updated_at
    BEFORE UPDATE ON assessment_pregnancy
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pregnancy IS
    '1:1 with assessment. Pregnancy status — safety-critical for anaesthetic planning.';
COMMENT ON COLUMN assessment_pregnancy.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_pregnancy.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_pregnancy.possibly_pregnant IS
    'Is the patient possibly pregnant? yes/no/empty.';
COMMENT ON COLUMN assessment_pregnancy.pregnancy_confirmed IS
    'Is pregnancy confirmed? yes/no/empty.';
COMMENT ON COLUMN assessment_pregnancy.gestation_weeks IS
    'Gestation in weeks, 0-45. NULL if not applicable.';
COMMENT ON COLUMN assessment_pregnancy.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_pregnancy.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

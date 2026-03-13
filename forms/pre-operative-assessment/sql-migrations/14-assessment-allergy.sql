-- ============================================================
-- 14_assessment_allergy.sql
-- Allergies (many-to-one with assessment).
-- ============================================================
-- Maps directly from the Allergy TypeScript interface.
-- Each row is one documented allergy.
-- ============================================================

CREATE TABLE assessment_allergy (
    -- Primary key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: each assessment can have multiple allergies
    assessment_id   UUID NOT NULL REFERENCES assessment(id) ON DELETE CASCADE,

    -- Allergy details
    allergen        TEXT NOT NULL DEFAULT '',
    reaction        TEXT NOT NULL DEFAULT '',
    severity        TEXT NOT NULL DEFAULT ''
                    CHECK (severity IN ('mild', 'moderate', 'anaphylaxis', '')),

    -- Display ordering (1-based)
    sort_order      INTEGER NOT NULL DEFAULT 0,

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all allergies for an assessment
CREATE INDEX idx_assessment_allergy_assessment_id
    ON assessment_allergy(assessment_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_allergy_updated_at
    BEFORE UPDATE ON assessment_allergy
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergy IS
    'Many-to-one with assessment. Each row is one documented allergy.';
COMMENT ON COLUMN assessment_allergy.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_allergy.assessment_id IS
    'FK to assessment. One assessment may have many allergies.';
COMMENT ON COLUMN assessment_allergy.allergen IS
    'Name of the allergen (e.g. Penicillin).';
COMMENT ON COLUMN assessment_allergy.reaction IS
    'Description of the allergic reaction.';
COMMENT ON COLUMN assessment_allergy.severity IS
    'Allergy severity: mild, moderate, anaphylaxis, or empty.';
COMMENT ON COLUMN assessment_allergy.sort_order IS
    'Display ordering for consistent list rendering.';
COMMENT ON COLUMN assessment_allergy.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_allergy.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

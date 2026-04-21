-- ============================================================
-- 16_assessment_social_history.sql
-- Social history subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the SocialHistory TypeScript interface.
-- ============================================================

CREATE TABLE assessment_social_history (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Alcohol
    alcohol                 TEXT NOT NULL DEFAULT ''
                            CHECK (alcohol IN ('none', 'occasional', 'moderate', 'heavy', '')),
    alcohol_units_per_week  INTEGER CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),

    -- Recreational drugs
    recreational_drugs      TEXT NOT NULL DEFAULT ''
                            CHECK (recreational_drugs IN ('yes', 'no', '')),
    drug_details            TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_social_history_updated_at
    BEFORE UPDATE ON assessment_social_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_history IS
    '1:1 with assessment. Social history: alcohol and recreational drug use.';
COMMENT ON COLUMN assessment_social_history.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_social_history.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_social_history.alcohol IS
    'Alcohol consumption frequency: none, occasional, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_social_history.alcohol_units_per_week IS
    'Estimated alcohol units per week. NULL if not disclosed.';
COMMENT ON COLUMN assessment_social_history.recreational_drugs IS
    'Does the patient use recreational drugs? yes/no/empty.';
COMMENT ON COLUMN assessment_social_history.drug_details IS
    'Free-text details about recreational drug use.';
COMMENT ON COLUMN assessment_social_history.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_social_history.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

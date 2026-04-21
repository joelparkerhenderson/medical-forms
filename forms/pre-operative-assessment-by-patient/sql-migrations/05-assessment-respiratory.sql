-- ============================================================
-- 05_assessment_respiratory.sql
-- Respiratory subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Respiratory TypeScript interface.
-- ============================================================

CREATE TABLE assessment_respiratory (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Asthma
    asthma              TEXT NOT NULL DEFAULT ''
                        CHECK (asthma IN ('yes', 'no', '')),
    asthma_frequency    TEXT NOT NULL DEFAULT ''
                        CHECK (asthma_frequency IN (
                            'intermittent', 'mild-persistent',
                            'moderate-persistent', 'severe-persistent', ''
                        )),

    -- COPD
    copd                TEXT NOT NULL DEFAULT ''
                        CHECK (copd IN ('yes', 'no', '')),
    copd_severity       TEXT NOT NULL DEFAULT ''
                        CHECK (copd_severity IN ('mild', 'moderate', 'severe', '')),

    -- Obstructive sleep apnoea
    osa                 TEXT NOT NULL DEFAULT ''
                        CHECK (osa IN ('yes', 'no', '')),
    osa_cpap            TEXT NOT NULL DEFAULT ''
                        CHECK (osa_cpap IN ('yes', 'no', '')),

    -- Smoking
    smoking             TEXT NOT NULL DEFAULT ''
                        CHECK (smoking IN ('current', 'ex', 'never', '')),
    smoking_pack_years  INTEGER CHECK (smoking_pack_years IS NULL OR smoking_pack_years >= 0),

    -- Recent upper respiratory tract infection
    recent_urti         TEXT NOT NULL DEFAULT ''
                        CHECK (recent_urti IN ('yes', 'no', '')),

    -- Ensure dependent fields are only set when parent condition is 'yes'
    CHECK (asthma = 'yes' OR asthma_frequency = ''),
    CHECK (copd = 'yes' OR copd_severity = ''),
    CHECK (osa = 'yes' OR osa_cpap = ''),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_respiratory_updated_at
    BEFORE UPDATE ON assessment_respiratory
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_respiratory IS
    '1:1 with assessment. Respiratory system questionnaire answers.';
COMMENT ON COLUMN assessment_respiratory.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_respiratory.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_respiratory.asthma IS
    'Does the patient have asthma? yes/no/empty.';
COMMENT ON COLUMN assessment_respiratory.asthma_frequency IS
    'Asthma frequency classification per GINA guidelines.';
COMMENT ON COLUMN assessment_respiratory.copd IS
    'Does the patient have COPD? yes/no/empty.';
COMMENT ON COLUMN assessment_respiratory.copd_severity IS
    'COPD severity: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_respiratory.osa IS
    'Does the patient have obstructive sleep apnoea? yes/no/empty.';
COMMENT ON COLUMN assessment_respiratory.osa_cpap IS
    'Is the patient on CPAP for OSA? yes/no/empty.';
COMMENT ON COLUMN assessment_respiratory.smoking IS
    'Smoking status: current, ex, never, or empty.';
COMMENT ON COLUMN assessment_respiratory.smoking_pack_years IS
    'Estimated pack-years of smoking. NULL if not applicable.';
COMMENT ON COLUMN assessment_respiratory.recent_urti IS
    'Has the patient had a recent URTI? yes/no/empty.';
COMMENT ON COLUMN assessment_respiratory.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_respiratory.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

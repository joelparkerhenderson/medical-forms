-- ============================================================
-- 12_assessment_gastrointestinal.sql
-- Gastrointestinal subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Gastrointestinal TypeScript interface.
-- Relevant for aspiration risk assessment.
-- ============================================================

CREATE TABLE assessment_gastrointestinal (
    -- Primary key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- GORD (gastro-oesophageal reflux disease)
    gord            TEXT NOT NULL DEFAULT ''
                    CHECK (gord IN ('yes', 'no', '')),

    -- Hiatus hernia
    hiatus_hernia   TEXT NOT NULL DEFAULT ''
                    CHECK (hiatus_hernia IN ('yes', 'no', '')),

    -- Nausea / vomiting tendency
    nausea          TEXT NOT NULL DEFAULT ''
                    CHECK (nausea IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_gastrointestinal_updated_at
    BEFORE UPDATE ON assessment_gastrointestinal
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gastrointestinal IS
    '1:1 with assessment. Gastrointestinal questionnaire answers, relevant for aspiration risk.';
COMMENT ON COLUMN assessment_gastrointestinal.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_gastrointestinal.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_gastrointestinal.gord IS
    'Does the patient have GORD? yes/no/empty. Increases aspiration risk.';
COMMENT ON COLUMN assessment_gastrointestinal.hiatus_hernia IS
    'Does the patient have a hiatus hernia? yes/no/empty. Increases aspiration risk.';
COMMENT ON COLUMN assessment_gastrointestinal.nausea IS
    'Does the patient have a tendency to nausea/vomiting? yes/no/empty.';
COMMENT ON COLUMN assessment_gastrointestinal.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_gastrointestinal.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

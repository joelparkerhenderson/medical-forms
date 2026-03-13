-- ============================================================
-- 09_assessment_neurological.sql
-- Neurological subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Neurological TypeScript interface.
-- ============================================================

CREATE TABLE assessment_neurological (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Stroke / TIA
    stroke_or_tia           TEXT NOT NULL DEFAULT ''
                            CHECK (stroke_or_tia IN ('yes', 'no', '')),
    stroke_details          TEXT NOT NULL DEFAULT '',

    -- Epilepsy
    epilepsy                TEXT NOT NULL DEFAULT ''
                            CHECK (epilepsy IN ('yes', 'no', '')),
    epilepsy_controlled     TEXT NOT NULL DEFAULT ''
                            CHECK (epilepsy_controlled IN ('yes', 'no', '')),

    -- Neuromuscular disease
    neuromuscular_disease   TEXT NOT NULL DEFAULT ''
                            CHECK (neuromuscular_disease IN ('yes', 'no', '')),
    neuromuscular_details   TEXT NOT NULL DEFAULT '',

    -- Raised intracranial pressure
    raised_icp              TEXT NOT NULL DEFAULT ''
                            CHECK (raised_icp IN ('yes', 'no', '')),

    -- Ensure dependent fields are only set when parent condition is 'yes'
    CHECK (epilepsy = 'yes' OR epilepsy_controlled = ''),

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_neurological_updated_at
    BEFORE UPDATE ON assessment_neurological
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_neurological IS
    '1:1 with assessment. Neurological system questionnaire answers.';
COMMENT ON COLUMN assessment_neurological.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_neurological.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_neurological.stroke_or_tia IS
    'Has the patient had a stroke or TIA? yes/no/empty.';
COMMENT ON COLUMN assessment_neurological.stroke_details IS
    'Free-text details about stroke/TIA history.';
COMMENT ON COLUMN assessment_neurological.epilepsy IS
    'Does the patient have epilepsy? yes/no/empty.';
COMMENT ON COLUMN assessment_neurological.epilepsy_controlled IS
    'Is epilepsy well controlled? yes/no/empty.';
COMMENT ON COLUMN assessment_neurological.neuromuscular_disease IS
    'Does the patient have neuromuscular disease? yes/no/empty.';
COMMENT ON COLUMN assessment_neurological.neuromuscular_details IS
    'Free-text details about neuromuscular disease.';
COMMENT ON COLUMN assessment_neurological.raised_icp IS
    'Does the patient have raised intracranial pressure? yes/no/empty.';
COMMENT ON COLUMN assessment_neurological.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_neurological.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

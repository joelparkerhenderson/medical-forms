-- ============================================================
-- 04_assessment_cardiovascular.sql
-- Cardiovascular subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Cardiovascular TypeScript interface.
-- TEXT + CHECK constraints are used instead of ENUM types
-- for easier schema evolution.
-- ============================================================

CREATE TABLE assessment_cardiovascular (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Hypertension
    hypertension                TEXT NOT NULL DEFAULT ''
                                CHECK (hypertension IN ('yes', 'no', '')),
    hypertension_controlled     TEXT NOT NULL DEFAULT ''
                                CHECK (hypertension_controlled IN ('yes', 'no', '')),

    -- Ischaemic heart disease
    ischemic_heart_disease      TEXT NOT NULL DEFAULT ''
                                CHECK (ischemic_heart_disease IN ('yes', 'no', '')),
    ihd_details                 TEXT NOT NULL DEFAULT '',

    -- Heart failure
    heart_failure               TEXT NOT NULL DEFAULT ''
                                CHECK (heart_failure IN ('yes', 'no', '')),
    heart_failure_nyha          TEXT NOT NULL DEFAULT ''
                                CHECK (heart_failure_nyha IN ('1', '2', '3', '4', '')),

    -- Valvular disease
    valvular_disease            TEXT NOT NULL DEFAULT ''
                                CHECK (valvular_disease IN ('yes', 'no', '')),
    valvular_details            TEXT NOT NULL DEFAULT '',

    -- Arrhythmia
    arrhythmia                  TEXT NOT NULL DEFAULT ''
                                CHECK (arrhythmia IN ('yes', 'no', '')),
    arrhythmia_type             TEXT NOT NULL DEFAULT '',

    -- Pacemaker / ICD
    pacemaker                   TEXT NOT NULL DEFAULT ''
                                CHECK (pacemaker IN ('yes', 'no', '')),

    -- Recent myocardial infarction
    recent_mi                   TEXT NOT NULL DEFAULT ''
                                CHECK (recent_mi IN ('yes', 'no', '')),
    recent_mi_weeks             INTEGER CHECK (recent_mi_weeks IS NULL OR recent_mi_weeks >= 0),

    -- Ensure dependent fields are only set when parent condition is 'yes'
    CHECK (hypertension = 'yes' OR hypertension_controlled = ''),
    CHECK (heart_failure = 'yes' OR heart_failure_nyha = ''),
    CHECK (recent_mi = 'yes' OR recent_mi_weeks IS NULL),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_cardiovascular_updated_at
    BEFORE UPDATE ON assessment_cardiovascular
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular IS
    '1:1 with assessment. Cardiovascular system questionnaire answers.';
COMMENT ON COLUMN assessment_cardiovascular.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_cardiovascular.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_cardiovascular.hypertension IS
    'Does the patient have hypertension? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.hypertension_controlled IS
    'Is hypertension controlled? yes/no/empty. Relevant only when hypertension = yes.';
COMMENT ON COLUMN assessment_cardiovascular.ischemic_heart_disease IS
    'Does the patient have ischaemic heart disease? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.ihd_details IS
    'Free-text details about IHD history (stents, CABG, etc.).';
COMMENT ON COLUMN assessment_cardiovascular.heart_failure IS
    'Does the patient have heart failure? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.heart_failure_nyha IS
    'NYHA functional class: 1-4 or empty. Relevant only when heart_failure = yes.';
COMMENT ON COLUMN assessment_cardiovascular.valvular_disease IS
    'Does the patient have valvular heart disease? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.valvular_details IS
    'Free-text details about valvular disease (type, severity).';
COMMENT ON COLUMN assessment_cardiovascular.arrhythmia IS
    'Does the patient have an arrhythmia? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.arrhythmia_type IS
    'Free-text arrhythmia type (e.g. atrial fibrillation).';
COMMENT ON COLUMN assessment_cardiovascular.pacemaker IS
    'Does the patient have a pacemaker or ICD? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.recent_mi IS
    'Has the patient had a recent myocardial infarction? yes/no/empty.';
COMMENT ON COLUMN assessment_cardiovascular.recent_mi_weeks IS
    'Weeks since MI. NULL if not applicable or unanswered.';
COMMENT ON COLUMN assessment_cardiovascular.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_cardiovascular.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

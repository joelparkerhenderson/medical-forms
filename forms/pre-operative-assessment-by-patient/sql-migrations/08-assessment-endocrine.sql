-- ============================================================
-- 08_assessment_endocrine.sql
-- Endocrine subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Endocrine TypeScript interface.
-- ============================================================

CREATE TABLE assessment_endocrine (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Diabetes
    diabetes                TEXT NOT NULL DEFAULT ''
                            CHECK (diabetes IN ('type1', 'type2', 'gestational', 'none', '')),
    diabetes_control        TEXT NOT NULL DEFAULT ''
                            CHECK (diabetes_control IN ('well-controlled', 'poorly-controlled', '')),
    diabetes_on_insulin     TEXT NOT NULL DEFAULT ''
                            CHECK (diabetes_on_insulin IN ('yes', 'no', '')),

    -- Ensure diabetes_control and diabetes_on_insulin are only set when diabetes is present
    CHECK (diabetes IN ('type1', 'type2', 'gestational') OR diabetes_control = ''),
    CHECK (diabetes IN ('type1', 'type2', 'gestational') OR diabetes_on_insulin = ''),

    -- Thyroid
    thyroid_disease         TEXT NOT NULL DEFAULT ''
                            CHECK (thyroid_disease IN ('yes', 'no', '')),
    thyroid_type            TEXT NOT NULL DEFAULT ''
                            CHECK (thyroid_type IN ('hypothyroid', 'hyperthyroid', '')),

    -- Adrenal
    adrenal_insufficiency   TEXT NOT NULL DEFAULT ''
                            CHECK (adrenal_insufficiency IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_endocrine_updated_at
    BEFORE UPDATE ON assessment_endocrine
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_endocrine IS
    '1:1 with assessment. Endocrine system questionnaire answers.';
COMMENT ON COLUMN assessment_endocrine.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_endocrine.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_endocrine.diabetes IS
    'Diabetes type: type1, type2, gestational, none, or empty.';
COMMENT ON COLUMN assessment_endocrine.diabetes_control IS
    'Diabetes control status. Relevant only when diabetes is not none/empty.';
COMMENT ON COLUMN assessment_endocrine.diabetes_on_insulin IS
    'Is the patient on insulin? yes/no/empty.';
COMMENT ON COLUMN assessment_endocrine.thyroid_disease IS
    'Does the patient have thyroid disease? yes/no/empty.';
COMMENT ON COLUMN assessment_endocrine.thyroid_type IS
    'Thyroid condition type: hypothyroid, hyperthyroid, or empty.';
COMMENT ON COLUMN assessment_endocrine.adrenal_insufficiency IS
    'Does the patient have adrenal insufficiency? yes/no/empty.';
COMMENT ON COLUMN assessment_endocrine.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_endocrine.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

-- ============================================================
-- 07_assessment_hepatic.sql
-- Hepatic subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Hepatic TypeScript interface.
-- ============================================================

CREATE TABLE assessment_hepatic (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Liver disease
    liver_disease       TEXT NOT NULL DEFAULT ''
                        CHECK (liver_disease IN ('yes', 'no', '')),

    -- Cirrhosis and severity
    cirrhosis           TEXT NOT NULL DEFAULT ''
                        CHECK (cirrhosis IN ('yes', 'no', '')),
    child_pugh_score    TEXT NOT NULL DEFAULT ''
                        CHECK (child_pugh_score IN ('A', 'B', 'C', '')),

    -- Hepatitis
    hepatitis           TEXT NOT NULL DEFAULT ''
                        CHECK (hepatitis IN ('yes', 'no', '')),
    hepatitis_type      TEXT NOT NULL DEFAULT '',

    -- Ensure dependent fields are only set when parent condition is 'yes'
    CHECK (cirrhosis = 'yes' OR child_pugh_score = ''),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_hepatic_updated_at
    BEFORE UPDATE ON assessment_hepatic
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hepatic IS
    '1:1 with assessment. Hepatic system questionnaire answers.';
COMMENT ON COLUMN assessment_hepatic.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_hepatic.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_hepatic.liver_disease IS
    'Does the patient have liver disease? yes/no/empty.';
COMMENT ON COLUMN assessment_hepatic.cirrhosis IS
    'Does the patient have cirrhosis? yes/no/empty.';
COMMENT ON COLUMN assessment_hepatic.child_pugh_score IS
    'Child-Pugh classification: A, B, C, or empty. Relevant only when cirrhosis = yes.';
COMMENT ON COLUMN assessment_hepatic.hepatitis IS
    'Does the patient have hepatitis? yes/no/empty.';
COMMENT ON COLUMN assessment_hepatic.hepatitis_type IS
    'Free-text hepatitis type (e.g. Hepatitis B, C).';
COMMENT ON COLUMN assessment_hepatic.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_hepatic.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

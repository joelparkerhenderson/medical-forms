-- ============================================================
-- 10_assessment_haematological.sql
-- Haematological subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Haematological TypeScript interface.
-- ============================================================

CREATE TABLE assessment_haematological (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Bleeding disorder
    bleeding_disorder   TEXT NOT NULL DEFAULT ''
                        CHECK (bleeding_disorder IN ('yes', 'no', '')),
    bleeding_details    TEXT NOT NULL DEFAULT '',

    -- Anticoagulants
    on_anticoagulants   TEXT NOT NULL DEFAULT ''
                        CHECK (on_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_type  TEXT NOT NULL DEFAULT '',

    -- Sickle cell
    sickle_cell_disease TEXT NOT NULL DEFAULT ''
                        CHECK (sickle_cell_disease IN ('yes', 'no', '')),
    sickle_cell_trait   TEXT NOT NULL DEFAULT ''
                        CHECK (sickle_cell_trait IN ('yes', 'no', '')),

    -- Anaemia
    anaemia             TEXT NOT NULL DEFAULT ''
                        CHECK (anaemia IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_haematological_updated_at
    BEFORE UPDATE ON assessment_haematological
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_haematological IS
    '1:1 with assessment. Haematological system questionnaire answers.';
COMMENT ON COLUMN assessment_haematological.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_haematological.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_haematological.bleeding_disorder IS
    'Does the patient have a bleeding disorder? yes/no/empty.';
COMMENT ON COLUMN assessment_haematological.bleeding_details IS
    'Free-text details about the bleeding disorder.';
COMMENT ON COLUMN assessment_haematological.on_anticoagulants IS
    'Is the patient on anticoagulants? yes/no/empty.';
COMMENT ON COLUMN assessment_haematological.anticoagulant_type IS
    'Free-text anticoagulant name (e.g. warfarin, rivaroxaban).';
COMMENT ON COLUMN assessment_haematological.sickle_cell_disease IS
    'Does the patient have sickle cell disease? yes/no/empty.';
COMMENT ON COLUMN assessment_haematological.sickle_cell_trait IS
    'Does the patient carry sickle cell trait? yes/no/empty.';
COMMENT ON COLUMN assessment_haematological.anaemia IS
    'Does the patient have anaemia? yes/no/empty.';
COMMENT ON COLUMN assessment_haematological.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_haematological.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

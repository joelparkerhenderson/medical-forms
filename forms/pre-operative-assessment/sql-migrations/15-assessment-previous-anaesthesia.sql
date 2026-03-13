-- ============================================================
-- 15_assessment_previous_anaesthesia.sql
-- Previous anaesthesia subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the PreviousAnaesthesia TypeScript
-- interface. Captures prior anaesthetic history including
-- malignant hyperthermia family history.
-- ============================================================

CREATE TABLE assessment_previous_anaesthesia (
    -- Primary key
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id                   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Previous anaesthesia history
    previous_anaesthesia            TEXT NOT NULL DEFAULT ''
                                    CHECK (previous_anaesthesia IN ('yes', 'no', '')),
    anaesthesia_problems            TEXT NOT NULL DEFAULT ''
                                    CHECK (anaesthesia_problems IN ('yes', 'no', '')),
    anaesthesia_problem_details     TEXT NOT NULL DEFAULT '',

    -- Malignant hyperthermia family history
    family_mh_history               TEXT NOT NULL DEFAULT ''
                                    CHECK (family_mh_history IN ('yes', 'no', '')),
    family_mh_details               TEXT NOT NULL DEFAULT '',

    -- Post-operative nausea and vomiting history
    ponv                            TEXT NOT NULL DEFAULT ''
                                    CHECK (ponv IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_previous_anaesthesia_updated_at
    BEFORE UPDATE ON assessment_previous_anaesthesia
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_anaesthesia IS
    '1:1 with assessment. Previous anaesthesia history and malignant hyperthermia screening.';
COMMENT ON COLUMN assessment_previous_anaesthesia.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_previous_anaesthesia.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_previous_anaesthesia.previous_anaesthesia IS
    'Has the patient had previous anaesthesia? yes/no/empty.';
COMMENT ON COLUMN assessment_previous_anaesthesia.anaesthesia_problems IS
    'Were there problems with previous anaesthesia? yes/no/empty.';
COMMENT ON COLUMN assessment_previous_anaesthesia.anaesthesia_problem_details IS
    'Free-text details about previous anaesthesia problems.';
COMMENT ON COLUMN assessment_previous_anaesthesia.family_mh_history IS
    'Family history of malignant hyperthermia? yes/no/empty. Safety-critical.';
COMMENT ON COLUMN assessment_previous_anaesthesia.family_mh_details IS
    'Free-text details about family MH history.';
COMMENT ON COLUMN assessment_previous_anaesthesia.ponv IS
    'History of post-operative nausea and vomiting? yes/no/empty.';
COMMENT ON COLUMN assessment_previous_anaesthesia.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_previous_anaesthesia.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

-- ============================================================
-- 17_assessment_functional_capacity.sql
-- Functional capacity subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the FunctionalCapacity TypeScript
-- interface. Estimated METs are used in ASA grading (FC-001).
-- ============================================================

CREATE TABLE assessment_functional_capacity (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Exercise tolerance
    exercise_tolerance      TEXT NOT NULL DEFAULT ''
                            CHECK (exercise_tolerance IN (
                                'unable', 'light-housework', 'climb-stairs',
                                'moderate-exercise', 'vigorous-exercise', ''
                            )),

    -- Metabolic equivalents (estimated from exercise tolerance)
    estimated_mets          NUMERIC(3,1)
                            CHECK (estimated_mets IS NULL OR estimated_mets >= 0),

    -- Mobility aids
    mobility_aids           TEXT NOT NULL DEFAULT ''
                            CHECK (mobility_aids IN ('yes', 'no', '')),

    -- Recent decline in function
    recent_decline          TEXT NOT NULL DEFAULT ''
                            CHECK (recent_decline IN ('yes', 'no', '')),

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_functional_capacity_updated_at
    BEFORE UPDATE ON assessment_functional_capacity
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_capacity IS
    '1:1 with assessment. Functional capacity and exercise tolerance data.';
COMMENT ON COLUMN assessment_functional_capacity.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_functional_capacity.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_functional_capacity.exercise_tolerance IS
    'Self-reported exercise tolerance level.';
COMMENT ON COLUMN assessment_functional_capacity.estimated_mets IS
    'Estimated metabolic equivalents. <4 METs triggers ASA rule FC-001.';
COMMENT ON COLUMN assessment_functional_capacity.mobility_aids IS
    'Does the patient use mobility aids? yes/no/empty.';
COMMENT ON COLUMN assessment_functional_capacity.recent_decline IS
    'Has there been a recent decline in functional capacity? yes/no/empty.';
COMMENT ON COLUMN assessment_functional_capacity.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_functional_capacity.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

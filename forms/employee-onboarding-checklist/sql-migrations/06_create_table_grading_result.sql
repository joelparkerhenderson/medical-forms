CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    completion_percentage NUMERIC(5,1) NOT NULL DEFAULT 0
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    completion_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (completion_status IN ('not-started', 'in-progress', 'mostly-complete', 'complete', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    items_completed INTEGER NOT NULL DEFAULT 0,
    items_total INTEGER NOT NULL DEFAULT 0,
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed onboarding completion grading result. Completion percentage 0-100% with status categories. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.completion_percentage IS
    'Overall completion percentage from 0 to 100.';
COMMENT ON COLUMN grading_result.completion_status IS
    'Completion status: not-started (0%), in-progress (1-49%), mostly-complete (50-89%), complete (90-100%), or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall onboarding risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.items_completed IS
    'Number of checklist items completed.';
COMMENT ON COLUMN grading_result.items_total IS
    'Total number of checklist items.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

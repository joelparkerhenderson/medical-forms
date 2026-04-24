CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    vaccination_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (vaccination_level IN ('upToDate', 'partiallyComplete', 'overdue', 'contraindicated', 'draft', '')),
    vaccination_score SMALLINT NOT NULL DEFAULT 0
        CHECK (vaccination_score >= 0 AND vaccination_score <= 100),
    graded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Grading result summarizing vaccination level and composite score. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.vaccination_level IS
    'Vaccination compliance level: upToDate, partiallyComplete, overdue, contraindicated, or draft.';
COMMENT ON COLUMN grading_result.vaccination_score IS
    'Composite vaccination score (0-100).';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Graded at.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

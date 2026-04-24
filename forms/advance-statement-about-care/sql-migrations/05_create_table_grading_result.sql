CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    completeness_level VARCHAR(12) NOT NULL DEFAULT 'incomplete'
        CHECK (completeness_level IN ('complete', 'partial', 'incomplete')),
    sections_completed INTEGER NOT NULL DEFAULT 0
        CHECK (sections_completed >= 0),
    total_sections INTEGER NOT NULL DEFAULT 9
        CHECK (total_sections >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed completeness grading result for the advance statement about care. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.completeness_level IS
    'Overall completeness classification: complete, partial, or incomplete.';
COMMENT ON COLUMN grading_result.sections_completed IS
    'Number of sections that have been adequately completed.';
COMMENT ON COLUMN grading_result.total_sections IS
    'Total number of sections in the advance statement.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the completeness grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

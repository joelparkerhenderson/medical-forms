-- 05-grading-result.sql
-- Stores the computed form completeness validation result for a care privacy notice assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_status VARCHAR(20) NOT NULL DEFAULT 'incomplete'
        CHECK (overall_status IN ('complete', 'incomplete')),
    completeness_score INT NOT NULL DEFAULT 0
        CHECK (completeness_score >= 0),
    flagged_issues_count INT NOT NULL DEFAULT 0
        CHECK (flagged_issues_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed form completeness validation result for the care privacy notice. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1 relationship).';
COMMENT ON COLUMN grading_result.overall_status IS
    'Overall form completeness: complete or incomplete.';
COMMENT ON COLUMN grading_result.completeness_score IS
    'Numeric completeness score computed by the grading engine (0 or higher).';
COMMENT ON COLUMN grading_result.flagged_issues_count IS
    'Number of validation issues flagged during grading.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when the row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when the row was last updated.';

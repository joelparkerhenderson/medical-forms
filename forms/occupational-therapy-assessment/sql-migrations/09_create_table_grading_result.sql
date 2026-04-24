CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    performance_mean_score NUMERIC(3,1)
        CHECK (performance_mean_score IS NULL OR (performance_mean_score >= 1.0 AND performance_mean_score <= 10.0)),
    satisfaction_mean_score NUMERIC(3,1)
        CHECK (satisfaction_mean_score IS NULL OR (satisfaction_mean_score >= 1.0 AND satisfaction_mean_score <= 10.0)),
    performance_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (performance_category IN ('significant-issues', 'moderate-concerns', 'good-performance', '')),
    satisfaction_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (satisfaction_category IN ('significant-issues', 'moderate-concerns', 'good-performance', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed COPM grading result for the occupational therapy assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.performance_mean_score IS
    'Mean COPM performance score across all rated occupational issues (1-10).';
COMMENT ON COLUMN grading_result.satisfaction_mean_score IS
    'Mean COPM satisfaction score across all rated occupational issues (1-10).';
COMMENT ON COLUMN grading_result.performance_category IS
    'Performance category: significant-issues (<5), moderate-concerns (5-7), good-performance (>7), or empty.';
COMMENT ON COLUMN grading_result.satisfaction_category IS
    'Satisfaction category: significant-issues (<5), moderate-concerns (5-7), good-performance (>7), or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the COPM grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

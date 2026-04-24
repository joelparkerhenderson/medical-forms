CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    risk_level VARCHAR(10) NOT NULL DEFAULT 'low'
        CHECK (risk_level IN ('low', 'moderate', 'high')),
    total_risk_score INTEGER NOT NULL DEFAULT 0
        CHECK (total_risk_score >= 0),
    cancer_genetics_score INTEGER NOT NULL DEFAULT 0
        CHECK (cancer_genetics_score >= 0),
    cardiovascular_genetics_score INTEGER NOT NULL DEFAULT 0
        CHECK (cardiovascular_genetics_score >= 0),
    neurogenetics_score INTEGER NOT NULL DEFAULT 0
        CHECK (neurogenetics_score >= 0),
    reproductive_genetics_score INTEGER NOT NULL DEFAULT 0
        CHECK (reproductive_genetics_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed genetic risk stratification result. 0-2 = Low, 3-5 = Moderate, 6+ = High. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.risk_level IS
    'Overall risk classification: low, moderate, or high.';
COMMENT ON COLUMN grading_result.total_risk_score IS
    'Total weighted risk score across all genetics domains (0-6+).';
COMMENT ON COLUMN grading_result.cancer_genetics_score IS
    'Risk sub-score for cancer genetics domain.';
COMMENT ON COLUMN grading_result.cardiovascular_genetics_score IS
    'Risk sub-score for cardiovascular genetics domain.';
COMMENT ON COLUMN grading_result.neurogenetics_score IS
    'Risk sub-score for neurogenetics domain.';
COMMENT ON COLUMN grading_result.reproductive_genetics_score IS
    'Risk sub-score for reproductive genetics domain.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

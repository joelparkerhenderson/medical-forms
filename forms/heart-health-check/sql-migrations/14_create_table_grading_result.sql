CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    risk_category VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (risk_category IN ('draft', 'low', 'moderate', 'high')),
    ten_year_risk_percent NUMERIC(5, 1) NOT NULL DEFAULT 0
        CHECK (ten_year_risk_percent >= 0 AND ten_year_risk_percent <= 100),
    heart_age SMALLINT
        CHECK (heart_age IS NULL OR (heart_age >= 0 AND heart_age <= 150)),
    graded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Grading result summarizing 10-year CVD risk and heart age. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.risk_category IS
    'Risk classification: draft, low, moderate, or high.';
COMMENT ON COLUMN grading_result.ten_year_risk_percent IS
    'Estimated 10-year cardiovascular disease risk percentage.';
COMMENT ON COLUMN grading_result.heart_age IS
    'Estimated heart age in years.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was last performed.';

COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

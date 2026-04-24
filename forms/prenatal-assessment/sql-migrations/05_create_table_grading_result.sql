CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    risk_level VARCHAR(10) NOT NULL DEFAULT 'low'
        CHECK (risk_level IN ('low', 'moderate', 'high')),
    risk_score INTEGER NOT NULL DEFAULT 0
        CHECK (risk_score >= 0),
    obstetric_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (obstetric_risk IN ('low', 'moderate', 'high', '')),
    medical_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (medical_risk IN ('low', 'moderate', 'high', '')),
    mental_health_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (mental_health_risk IN ('low', 'moderate', 'high', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed prenatal risk stratification result. Risk level based on obstetric, medical, and mental health factors. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.risk_level IS
    'Overall prenatal risk level: low, moderate, or high.';
COMMENT ON COLUMN grading_result.risk_score IS
    'Aggregate risk score across all domains.';
COMMENT ON COLUMN grading_result.obstetric_risk IS
    'Risk level from obstetric history: low, moderate, high, or empty.';
COMMENT ON COLUMN grading_result.medical_risk IS
    'Risk level from medical history: low, moderate, high, or empty.';
COMMENT ON COLUMN grading_result.mental_health_risk IS
    'Risk level from mental health screening: low, moderate, high, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

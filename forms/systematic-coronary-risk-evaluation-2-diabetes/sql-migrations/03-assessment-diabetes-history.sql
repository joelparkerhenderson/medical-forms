-- 03_assessment_diabetes_history.sql
-- Diabetes history section of the assessment.

CREATE TABLE assessment_diabetes_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    diabetes_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type1', 'type2', 'other', '')),
    age_at_diagnosis INTEGER
        CHECK (age_at_diagnosis IS NULL OR (age_at_diagnosis >= 0 AND age_at_diagnosis <= 120)),
    diabetes_duration_years INTEGER
        CHECK (diabetes_duration_years IS NULL OR (diabetes_duration_years >= 0 AND diabetes_duration_years <= 100)),
    hba1c_value NUMERIC(5,1),
    hba1c_unit VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hba1c_unit IN ('mmol/mol', 'percent', '')),
    fasting_glucose NUMERIC(5,1),
    diabetes_treatment VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (diabetes_treatment IN ('diet', 'oral', 'injectable', 'insulin', 'combination', '')),
    insulin_duration_years INTEGER
        CHECK (insulin_duration_years IS NULL OR (insulin_duration_years >= 0 AND insulin_duration_years <= 80)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_diabetes_history_updated_at
    BEFORE UPDATE ON assessment_diabetes_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_diabetes_history IS
    'Diabetes history section: type, duration, glycaemic control, and treatment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_diabetes_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_diabetes_history.diabetes_type IS
    'Diabetes type: type1, type2, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_diabetes_history.hba1c_value IS
    'HbA1c value (units specified by hba1c_unit).';
COMMENT ON COLUMN assessment_diabetes_history.hba1c_unit IS
    'HbA1c unit: mmol/mol or percent.';
COMMENT ON COLUMN assessment_diabetes_history.diabetes_treatment IS
    'Current diabetes treatment approach.';

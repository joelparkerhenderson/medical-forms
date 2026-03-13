-- ============================================================
-- 03_assessment_diabetes_history.sql
-- Diabetes history section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_diabetes_history (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    diabetes_type           TEXT NOT NULL DEFAULT ''
                            CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'other', '')),
    age_at_diagnosis        INTEGER CHECK (age_at_diagnosis IS NULL OR (age_at_diagnosis >= 0 AND age_at_diagnosis <= 120)),
    years_duration          INTEGER CHECK (years_duration IS NULL OR (years_duration >= 0 AND years_duration <= 100)),
    diagnosis_method        TEXT NOT NULL DEFAULT ''
                            CHECK (diagnosis_method IN ('hba1c', 'fastingGlucose', 'ogtt', 'randomGlucose', 'other', '')),
    family_history          TEXT NOT NULL DEFAULT ''
                            CHECK (family_history IN ('yes', 'no', '')),
    autoantibodies_tested   TEXT NOT NULL DEFAULT ''
                            CHECK (autoantibodies_tested IN ('yes', 'negative', 'notTested', '')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_diabetes_history_updated_at
    BEFORE UPDATE ON assessment_diabetes_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_diabetes_history IS
    '1:1 with assessment. Diabetes diagnosis and history details.';
COMMENT ON COLUMN assessment_diabetes_history.diabetes_type IS
    'Diabetes classification: type1, type2, gestational, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_diabetes_history.age_at_diagnosis IS
    'Age in years when diabetes was diagnosed. NULL if not recorded.';
COMMENT ON COLUMN assessment_diabetes_history.years_duration IS
    'Number of years since diagnosis. NULL if not recorded.';
COMMENT ON COLUMN assessment_diabetes_history.diagnosis_method IS
    'Method used for initial diagnosis. Empty string if unanswered.';
COMMENT ON COLUMN assessment_diabetes_history.family_history IS
    'Family history of diabetes: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_diabetes_history.autoantibodies_tested IS
    'Autoantibody testing status: yes (positive), negative, notTested, or empty string.';

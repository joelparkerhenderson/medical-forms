-- 09_assessment_medical_history.sql
-- Step 7: Medical history section of the dental assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiovascular_disease IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type_1', 'type_2', '')),
    has_bleeding_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_bleeding_disorder IN ('yes', 'no', '')),
    bleeding_disorder_details TEXT NOT NULL DEFAULT '',
    has_respiratory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_respiratory_disease IN ('yes', 'no', '')),
    respiratory_details TEXT NOT NULL DEFAULT '',
    has_hepatitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hepatitis IN ('yes', 'no', '')),
    hepatitis_type VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_type IN ('a', 'b', 'c', '')),
    has_hiv VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hiv IN ('yes', 'no', '')),
    has_epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_epilepsy IN ('yes', 'no', '')),
    has_osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_osteoporosis IN ('yes', 'no', '')),
    bisphosphonate_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bisphosphonate_use IN ('yes', 'no', '')),
    has_immunosuppression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_immunosuppression IN ('yes', 'no', '')),
    immunosuppression_details TEXT NOT NULL DEFAULT '',
    is_pregnant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (is_pregnant IN ('yes', 'no', 'na', '')),
    pregnancy_trimester VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pregnancy_trimester IN ('first', 'second', 'third', '')),
    tobacco_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tobacco_use IN ('current', 'former', 'never', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'moderate', 'heavy', '')),
    other_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Step 7 Medical History: systemic conditions relevant to dental treatment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_cardiovascular_disease IS
    'Whether the patient has cardiovascular disease.';
COMMENT ON COLUMN assessment_medical_history.cardiovascular_details IS
    'Details of cardiovascular conditions.';
COMMENT ON COLUMN assessment_medical_history.has_diabetes IS
    'Whether the patient has diabetes (relevant to periodontal disease).';
COMMENT ON COLUMN assessment_medical_history.diabetes_type IS
    'Type of diabetes: type_1 or type_2.';
COMMENT ON COLUMN assessment_medical_history.has_bleeding_disorder IS
    'Whether the patient has a bleeding disorder (critical for dental procedures).';
COMMENT ON COLUMN assessment_medical_history.bleeding_disorder_details IS
    'Details of the bleeding disorder.';
COMMENT ON COLUMN assessment_medical_history.has_respiratory_disease IS
    'Whether the patient has respiratory disease.';
COMMENT ON COLUMN assessment_medical_history.respiratory_details IS
    'Details of respiratory conditions.';
COMMENT ON COLUMN assessment_medical_history.has_hepatitis IS
    'Whether the patient has hepatitis (infection control relevance).';
COMMENT ON COLUMN assessment_medical_history.hepatitis_type IS
    'Hepatitis type: a, b, or c.';
COMMENT ON COLUMN assessment_medical_history.has_hiv IS
    'Whether the patient is HIV positive (infection control relevance).';
COMMENT ON COLUMN assessment_medical_history.has_epilepsy IS
    'Whether the patient has epilepsy (procedural sedation relevance).';
COMMENT ON COLUMN assessment_medical_history.has_osteoporosis IS
    'Whether the patient has osteoporosis (bisphosphonate-related osteonecrosis risk).';
COMMENT ON COLUMN assessment_medical_history.bisphosphonate_use IS
    'Whether the patient takes bisphosphonates (osteonecrosis of the jaw risk).';
COMMENT ON COLUMN assessment_medical_history.has_immunosuppression IS
    'Whether the patient is immunosuppressed.';
COMMENT ON COLUMN assessment_medical_history.immunosuppression_details IS
    'Details of immunosuppressive condition or therapy.';
COMMENT ON COLUMN assessment_medical_history.is_pregnant IS
    'Whether the patient is pregnant (affects treatment planning and radiography).';
COMMENT ON COLUMN assessment_medical_history.pregnancy_trimester IS
    'Current trimester of pregnancy.';
COMMENT ON COLUMN assessment_medical_history.tobacco_use IS
    'Tobacco use status: current, former, or never (periodontal risk factor).';
COMMENT ON COLUMN assessment_medical_history.alcohol_use IS
    'Alcohol consumption level.';
COMMENT ON COLUMN assessment_medical_history.other_conditions IS
    'Free-text description of any other relevant medical conditions.';

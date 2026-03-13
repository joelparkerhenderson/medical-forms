-- 06_medical_conditions.sql
-- Pre-existing medical conditions and medications relevant to CVD risk.

CREATE TABLE medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('no', 'type1', 'type2', '')),
    has_atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_atrial_fibrillation IN ('yes', 'no', '')),
    has_rheumatoid_arthritis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_rheumatoid_arthritis IN ('yes', 'no', '')),
    has_chronic_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_chronic_kidney_disease IN ('yes', 'no', '')),
    has_migraine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_migraine IN ('yes', 'no', '')),
    has_severe_mental_illness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_severe_mental_illness IN ('yes', 'no', '')),
    has_erectile_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_erectile_dysfunction IN ('yes', 'no', '')),
    on_atypical_antipsychotic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_atypical_antipsychotic IN ('yes', 'no', '')),
    on_corticosteroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_corticosteroids IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_medical_conditions_updated_at
    BEFORE UPDATE ON medical_conditions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE medical_conditions IS
    'Pre-existing medical conditions and medications relevant to cardiovascular risk.';
COMMENT ON COLUMN medical_conditions.has_diabetes IS
    'Diabetes status: no, type1, type2, or empty string.';
COMMENT ON COLUMN medical_conditions.has_atrial_fibrillation IS
    'Whether patient has atrial fibrillation.';
COMMENT ON COLUMN medical_conditions.has_chronic_kidney_disease IS
    'Whether patient has CKD stage 3+.';
COMMENT ON COLUMN medical_conditions.has_erectile_dysfunction IS
    'Whether patient has erectile dysfunction (male only).';
COMMENT ON COLUMN medical_conditions.on_atypical_antipsychotic IS
    'Whether patient is on atypical antipsychotic medication.';
COMMENT ON COLUMN medical_conditions.on_corticosteroids IS
    'Whether patient is on regular corticosteroids.';

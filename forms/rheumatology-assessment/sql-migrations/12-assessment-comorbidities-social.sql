-- 12_assessment_comorbidities_social.sql
-- Comorbidities and social factors section of the rheumatology assessment.

CREATE TABLE assessment_comorbidities_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Comorbidities relevant to rheumatology treatment
    cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_disease IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type1', 'type2', '')),
    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    chronic_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_kidney_disease IN ('yes', 'no', '')),
    hepatitis_b_or_c VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_or_c IN ('yes', 'no', '')),
    tuberculosis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tuberculosis_history IN ('yes', 'no', '')),
    osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (osteoporosis IN ('yes', 'no', '')),
    depression_anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression_anxiety IN ('yes', 'no', '')),
    malignancy_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (malignancy_history IN ('yes', 'no', '')),
    malignancy_details TEXT NOT NULL DEFAULT '',

    -- Social factors
    lives_alone VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lives_alone IN ('yes', 'no', '')),
    carer_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support IN ('yes', 'no', '')),
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'weekly', 'rarely', 'never', '')),
    vaccination_status_up_to_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaccination_status_up_to_date IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbidities_social_updated_at
    BEFORE UPDATE ON assessment_comorbidities_social
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbidities_social IS
    'Comorbidities and social section: comorbid conditions affecting treatment choices and social support. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbidities_social.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comorbidities_social.cardiovascular_disease IS
    'Whether patient has cardiovascular disease.';
COMMENT ON COLUMN assessment_comorbidities_social.cardiovascular_details IS
    'Details of cardiovascular disease if present.';
COMMENT ON COLUMN assessment_comorbidities_social.diabetes IS
    'Whether patient has diabetes.';
COMMENT ON COLUMN assessment_comorbidities_social.diabetes_type IS
    'Type of diabetes: type1, type2, or empty string if unanswered.';
COMMENT ON COLUMN assessment_comorbidities_social.hypertension IS
    'Whether patient has hypertension.';
COMMENT ON COLUMN assessment_comorbidities_social.chronic_kidney_disease IS
    'Whether patient has chronic kidney disease (relevant for DMARD dosing).';
COMMENT ON COLUMN assessment_comorbidities_social.hepatitis_b_or_c IS
    'Whether patient has hepatitis B or C (screening required before biologics).';
COMMENT ON COLUMN assessment_comorbidities_social.tuberculosis_history IS
    'Whether patient has tuberculosis history (screening required before biologics).';
COMMENT ON COLUMN assessment_comorbidities_social.osteoporosis IS
    'Whether patient has osteoporosis (common comorbidity with corticosteroid use).';
COMMENT ON COLUMN assessment_comorbidities_social.depression_anxiety IS
    'Whether patient has depression or anxiety.';
COMMENT ON COLUMN assessment_comorbidities_social.malignancy_history IS
    'Whether patient has a history of malignancy (affects biologic prescribing).';
COMMENT ON COLUMN assessment_comorbidities_social.malignancy_details IS
    'Details of malignancy history if present.';
COMMENT ON COLUMN assessment_comorbidities_social.lives_alone IS
    'Whether patient lives alone.';
COMMENT ON COLUMN assessment_comorbidities_social.carer_support IS
    'Whether patient has carer support.';
COMMENT ON COLUMN assessment_comorbidities_social.exercise_frequency IS
    'Exercise frequency: daily, weekly, rarely, never, or empty string if unanswered.';
COMMENT ON COLUMN assessment_comorbidities_social.vaccination_status_up_to_date IS
    'Whether vaccinations are up to date (important before immunosuppression).';
COMMENT ON COLUMN assessment_comorbidities_social.additional_notes IS
    'Free-text additional notes on comorbidities and social factors.';

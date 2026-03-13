-- 11_assessment_medical_lifestyle_factors.sql
-- Medical and lifestyle factors section of the sleep quality assessment.

CREATE TABLE assessment_medical_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Medical conditions affecting sleep
    obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obstructive_sleep_apnoea IN ('yes', 'no', '')),
    cpap_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cpap_use IN ('yes', 'no', '')),
    chronic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_pain IN ('yes', 'no', '')),
    chronic_pain_details TEXT NOT NULL DEFAULT '',
    depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression IN ('yes', 'no', '')),
    anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety IN ('yes', 'no', '')),
    ptsd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ptsd IN ('yes', 'no', '')),
    thyroid_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thyroid_disorder IN ('yes', 'no', '')),
    respiratory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (respiratory_disease IN ('yes', 'no', '')),
    cardiac_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiac_disease IN ('yes', 'no', '')),
    neurological_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neurological_condition IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',

    -- Lifestyle factors
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'several_per_week', 'weekly', 'rarely', 'never', '')),
    exercise_timing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_timing IN ('morning', 'afternoon', 'evening', 'varies', '')),
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'former', 'never', '')),
    alcohol_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_frequency IN ('daily', 'several_per_week', 'weekly', 'rarely', 'never', '')),
    stress_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stress_level IN ('low', 'moderate', 'high', 'very_high', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_lifestyle_factors_updated_at
    BEFORE UPDATE ON assessment_medical_lifestyle_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_lifestyle_factors IS
    'Medical and lifestyle factors section: comorbidities and lifestyle habits affecting sleep quality. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.obstructive_sleep_apnoea IS
    'Whether patient has diagnosed obstructive sleep apnoea.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.cpap_use IS
    'Whether patient uses CPAP (continuous positive airway pressure) therapy.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.chronic_pain IS
    'Whether patient has chronic pain affecting sleep.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.chronic_pain_details IS
    'Details of chronic pain condition.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.depression IS
    'Whether patient has depression (strong bidirectional relationship with sleep).';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.anxiety IS
    'Whether patient has anxiety.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.ptsd IS
    'Whether patient has post-traumatic stress disorder.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.thyroid_disorder IS
    'Whether patient has a thyroid disorder.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.respiratory_disease IS
    'Whether patient has respiratory disease (e.g. COPD, asthma).';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.cardiac_disease IS
    'Whether patient has cardiac disease.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.neurological_condition IS
    'Whether patient has a neurological condition affecting sleep.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.neurological_details IS
    'Details of neurological condition.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.exercise_frequency IS
    'Exercise frequency: daily, several_per_week, weekly, rarely, never, or empty string.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.exercise_timing IS
    'Typical time of day for exercise: morning, afternoon, evening, varies, or empty string.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.smoking_status IS
    'Smoking status: current, former, never, or empty string.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.alcohol_frequency IS
    'Alcohol consumption frequency: daily, several_per_week, weekly, rarely, never, or empty string.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.stress_level IS
    'Self-reported stress level: low, moderate, high, very_high, or empty string.';
COMMENT ON COLUMN assessment_medical_lifestyle_factors.additional_notes IS
    'Free-text additional notes on medical and lifestyle factors.';

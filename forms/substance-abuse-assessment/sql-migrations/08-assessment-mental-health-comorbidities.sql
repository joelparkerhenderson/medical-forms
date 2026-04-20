-- 08_assessment_mental_health_comorbidities.sql
-- Mental health comorbidities section of the substance abuse assessment.

CREATE TABLE assessment_mental_health_comorbidities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression IN ('yes', 'no', '')),
    depression_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (depression_severity IN ('mild', 'moderate', 'severe', '')),
    anxiety_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_disorder IN ('yes', 'no', '')),
    anxiety_disorder_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (anxiety_disorder_type IN ('generalised', 'social', 'panic', 'ptsd', 'ocd', 'other', '')),
    ptsd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ptsd IN ('yes', 'no', '')),
    ptsd_details TEXT NOT NULL DEFAULT '',
    bipolar_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bipolar_disorder IN ('yes', 'no', '')),
    psychosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychosis IN ('yes', 'no', '')),
    personality_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (personality_disorder IN ('yes', 'no', '')),
    eating_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (eating_disorder IN ('yes', 'no', '')),
    adhd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adhd IN ('yes', 'no', '')),
    suicidal_ideation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation IN ('yes', 'no', '')),
    suicidal_ideation_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation_current IN ('yes', 'no', '')),
    self_harm_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_harm_history IN ('yes', 'no', '')),
    previous_suicide_attempts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_suicide_attempts IN ('yes', 'no', '')),
    psychiatric_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychiatric_medication IN ('yes', 'no', '')),
    psychiatric_medication_details TEXT NOT NULL DEFAULT '',
    mental_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mental_health_comorbidities_updated_at
    BEFORE UPDATE ON assessment_mental_health_comorbidities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mental_health_comorbidities IS
    'Mental health comorbidities section: depression, anxiety, PTSD, psychosis, suicidality, and psychiatric medications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mental_health_comorbidities.depression IS
    'Whether the patient has depression: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.depression_severity IS
    'Depression severity: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.anxiety_disorder IS
    'Whether the patient has an anxiety disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.anxiety_disorder_type IS
    'Type of anxiety disorder: generalised, social, panic, ptsd, ocd, other, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.ptsd IS
    'Whether the patient has PTSD: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.ptsd_details IS
    'Details of PTSD including trauma type.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.bipolar_disorder IS
    'Whether the patient has bipolar disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.psychosis IS
    'Whether the patient has psychosis or schizophrenia: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.personality_disorder IS
    'Whether the patient has a personality disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.eating_disorder IS
    'Whether the patient has an eating disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.adhd IS
    'Whether the patient has ADHD: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.suicidal_ideation IS
    'Whether the patient has ever had suicidal ideation: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.suicidal_ideation_current IS
    'Whether the patient currently has suicidal ideation: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.self_harm_history IS
    'Whether the patient has a history of self-harm: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.previous_suicide_attempts IS
    'Whether the patient has previous suicide attempts: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.psychiatric_medication IS
    'Whether the patient is on psychiatric medication: yes, no, or empty.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.psychiatric_medication_details IS
    'Details of psychiatric medications including names and doses.';
COMMENT ON COLUMN assessment_mental_health_comorbidities.mental_health_notes IS
    'Additional clinician notes on mental health comorbidities.';

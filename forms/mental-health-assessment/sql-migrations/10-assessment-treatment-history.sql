-- 10_assessment_treatment_history.sql
-- Treatment history section of the mental health assessment.

CREATE TABLE assessment_treatment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_psychiatric_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_psychiatric_diagnosis IN ('yes', 'no', '')),
    previous_diagnoses TEXT NOT NULL DEFAULT '',
    previous_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_therapy IN ('yes', 'no', '')),
    therapy_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (therapy_type IN ('cbt', 'psychodynamic', 'humanistic', 'emdr', 'dbt', 'family', 'group', 'other', '')),
    therapy_details TEXT NOT NULL DEFAULT '',
    previous_psychiatric_admission VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_psychiatric_admission IN ('yes', 'no', '')),
    admission_count INTEGER
        CHECK (admission_count IS NULL OR admission_count >= 0),
    admission_details TEXT NOT NULL DEFAULT '',
    crisis_team_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (crisis_team_involvement IN ('yes', 'no', '')),
    sectioned_under_mental_health_act VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sectioned_under_mental_health_act IN ('yes', 'no', '')),
    section_details TEXT NOT NULL DEFAULT '',
    electroconvulsive_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (electroconvulsive_therapy IN ('yes', 'no', '')),
    treatment_response TEXT NOT NULL DEFAULT '',
    treatment_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_history_updated_at
    BEFORE UPDATE ON assessment_treatment_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_history IS
    'Treatment history section: previous diagnoses, therapy, psychiatric admissions, and Mental Health Act history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_history.previous_psychiatric_diagnosis IS
    'Whether the patient has a previous psychiatric diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.previous_diagnoses IS
    'Free-text list of previous psychiatric diagnoses.';
COMMENT ON COLUMN assessment_treatment_history.previous_therapy IS
    'Whether the patient has had previous psychological therapy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.therapy_type IS
    'Type of therapy: cbt, psychodynamic, humanistic, emdr, dbt, family, group, other, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.therapy_details IS
    'Free-text details of previous therapy (duration, therapist, outcome).';
COMMENT ON COLUMN assessment_treatment_history.previous_psychiatric_admission IS
    'Whether the patient has had a previous psychiatric inpatient admission: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.admission_count IS
    'Number of previous psychiatric admissions, if applicable.';
COMMENT ON COLUMN assessment_treatment_history.admission_details IS
    'Free-text details of psychiatric admissions.';
COMMENT ON COLUMN assessment_treatment_history.crisis_team_involvement IS
    'Whether the patient has had crisis team involvement: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.sectioned_under_mental_health_act IS
    'Whether the patient has been sectioned under the Mental Health Act: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.section_details IS
    'Free-text details of Mental Health Act section history.';
COMMENT ON COLUMN assessment_treatment_history.electroconvulsive_therapy IS
    'Whether the patient has received ECT: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_history.treatment_response IS
    'Free-text description of response to previous treatments.';
COMMENT ON COLUMN assessment_treatment_history.treatment_history_notes IS
    'Free-text clinician notes on treatment history.';

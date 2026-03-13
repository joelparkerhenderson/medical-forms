-- 04_assessment_psychiatric_history.sql
-- Psychiatric history section of the psychiatry assessment.

CREATE TABLE assessment_psychiatric_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_diagnoses TEXT NOT NULL DEFAULT '',
    age_first_contact INTEGER
        CHECK (age_first_contact IS NULL OR (age_first_contact >= 0 AND age_first_contact <= 120)),
    previous_inpatient_admissions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_inpatient_admissions IN ('yes', 'no', '')),
    inpatient_admission_count INTEGER
        CHECK (inpatient_admission_count IS NULL OR inpatient_admission_count >= 0),
    inpatient_details TEXT NOT NULL DEFAULT '',
    previous_sectioning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_sectioning IN ('yes', 'no', '')),
    sectioning_details TEXT NOT NULL DEFAULT '',
    previous_ect VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_ect IN ('yes', 'no', '')),
    previous_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_therapy IN ('yes', 'no', '')),
    therapy_types TEXT NOT NULL DEFAULT '',
    therapy_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (therapy_response IN ('good', 'partial', 'poor', 'no-response', '')),
    previous_medication_trials TEXT NOT NULL DEFAULT '',
    treatment_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (treatment_adherence IN ('good', 'fair', 'poor', '')),
    longest_period_of_wellness TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychiatric_history_updated_at
    BEFORE UPDATE ON assessment_psychiatric_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychiatric_history IS
    'Psychiatric history section: previous diagnoses, inpatient admissions, sectioning, ECT, therapy, and medication trials. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychiatric_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychiatric_history.previous_diagnoses IS
    'Free-text list of previous psychiatric diagnoses (e.g. ICD-10/DSM-5 codes).';
COMMENT ON COLUMN assessment_psychiatric_history.age_first_contact IS
    'Age at first contact with psychiatric services.';
COMMENT ON COLUMN assessment_psychiatric_history.previous_inpatient_admissions IS
    'Whether the patient has had previous psychiatric inpatient admissions.';
COMMENT ON COLUMN assessment_psychiatric_history.inpatient_admission_count IS
    'Number of previous psychiatric inpatient admissions.';
COMMENT ON COLUMN assessment_psychiatric_history.previous_sectioning IS
    'Whether the patient has been previously detained under the Mental Health Act.';
COMMENT ON COLUMN assessment_psychiatric_history.previous_ect IS
    'Whether the patient has previously received electroconvulsive therapy.';
COMMENT ON COLUMN assessment_psychiatric_history.previous_therapy IS
    'Whether the patient has received previous psychological therapy.';
COMMENT ON COLUMN assessment_psychiatric_history.therapy_types IS
    'Types of therapy received (e.g. CBT, psychodynamic, DBT, EMDR).';
COMMENT ON COLUMN assessment_psychiatric_history.therapy_response IS
    'Response to previous therapy: good, partial, poor, no-response, or empty.';
COMMENT ON COLUMN assessment_psychiatric_history.treatment_adherence IS
    'General treatment adherence: good, fair, poor, or empty.';

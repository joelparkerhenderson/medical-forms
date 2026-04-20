-- 09_assessment_patient_outcome.sql
-- Patient outcome section of the medical error report.

CREATE TABLE assessment_patient_outcome (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    harm_reached_patient VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (harm_reached_patient IN ('yes', 'no', '')),
    harm_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (harm_level IN ('none', 'low', 'moderate', 'severe', 'death', '')),
    harm_description TEXT NOT NULL DEFAULT '',
    additional_treatment_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (additional_treatment_required IN ('yes', 'no', '')),
    additional_treatment_details TEXT NOT NULL DEFAULT '',
    extended_hospital_stay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (extended_hospital_stay IN ('yes', 'no', '')),
    extra_days INTEGER,
    readmission_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (readmission_required IN ('yes', 'no', '')),
    permanent_disability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (permanent_disability IN ('yes', 'no', '')),
    disability_details TEXT NOT NULL DEFAULT '',
    patient_died VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_died IN ('yes', 'no', '')),
    death_date DATE,
    outcome_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_patient_outcome_updated_at
    BEFORE UPDATE ON assessment_patient_outcome
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_outcome IS
    'Patient outcome section: harm level, treatment required, hospitalisation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_patient_outcome.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_patient_outcome.harm_reached_patient IS
    'Whether harm reached the patient: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.harm_level IS
    'Level of harm: none, low, moderate, severe, death, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.harm_description IS
    'Description of the harm caused.';
COMMENT ON COLUMN assessment_patient_outcome.additional_treatment_required IS
    'Whether additional treatment was required: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.additional_treatment_details IS
    'Details of additional treatment required.';
COMMENT ON COLUMN assessment_patient_outcome.extended_hospital_stay IS
    'Whether the hospital stay was extended: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.extra_days IS
    'Number of extra days of hospitalisation.';
COMMENT ON COLUMN assessment_patient_outcome.readmission_required IS
    'Whether readmission was required: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.permanent_disability IS
    'Whether the error resulted in permanent disability: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.disability_details IS
    'Details of permanent disability.';
COMMENT ON COLUMN assessment_patient_outcome.patient_died IS
    'Whether the patient died as a result: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_outcome.death_date IS
    'Date of death if applicable.';
COMMENT ON COLUMN assessment_patient_outcome.outcome_notes IS
    'Additional notes on patient outcome.';

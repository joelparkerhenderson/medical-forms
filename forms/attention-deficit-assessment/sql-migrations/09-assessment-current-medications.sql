-- 09_assessment_current_medications.sql
-- Current medications section of the attention deficit assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_on_adhd_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_adhd_medication IN ('yes', 'no', '')),
    adhd_medication_name VARCHAR(255) NOT NULL DEFAULT '',
    adhd_medication_dose VARCHAR(100) NOT NULL DEFAULT '',
    adhd_medication_duration TEXT NOT NULL DEFAULT '',
    adhd_medication_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adhd_medication_response IN ('good', 'partial', 'none', '')),
    previous_adhd_medications TEXT NOT NULL DEFAULT '',
    previous_medication_side_effects TEXT NOT NULL DEFAULT '',
    other_psychiatric_medications TEXT NOT NULL DEFAULT '',
    other_regular_medications TEXT NOT NULL DEFAULT '',
    cardiovascular_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_history IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    blood_pressure_checked VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (blood_pressure_checked IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: ADHD-specific medications, psychiatric medications, and cardiovascular safety screening. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.currently_on_adhd_medication IS
    'Whether the patient is currently taking ADHD medication.';
COMMENT ON COLUMN assessment_current_medications.adhd_medication_name IS
    'Name of the current ADHD medication (e.g. methylphenidate, lisdexamfetamine).';
COMMENT ON COLUMN assessment_current_medications.adhd_medication_dose IS
    'Current dose of ADHD medication.';
COMMENT ON COLUMN assessment_current_medications.adhd_medication_duration IS
    'How long the patient has been on the current ADHD medication.';
COMMENT ON COLUMN assessment_current_medications.adhd_medication_response IS
    'Response to current ADHD medication: good, partial, none, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.previous_adhd_medications IS
    'Free-text list of previously tried ADHD medications and outcomes.';
COMMENT ON COLUMN assessment_current_medications.previous_medication_side_effects IS
    'Side effects experienced with previous ADHD medications.';
COMMENT ON COLUMN assessment_current_medications.other_psychiatric_medications IS
    'Other psychiatric medications currently taken.';
COMMENT ON COLUMN assessment_current_medications.other_regular_medications IS
    'Other regular medications currently taken.';
COMMENT ON COLUMN assessment_current_medications.cardiovascular_history IS
    'Whether the patient has any cardiovascular history (important for stimulant prescribing).';
COMMENT ON COLUMN assessment_current_medications.cardiovascular_details IS
    'Details of cardiovascular history.';
COMMENT ON COLUMN assessment_current_medications.blood_pressure_checked IS
    'Whether blood pressure has been checked (required before starting stimulant medication).';

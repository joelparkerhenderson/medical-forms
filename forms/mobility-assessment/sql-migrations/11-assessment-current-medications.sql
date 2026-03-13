-- 11_assessment_current_medications.sql
-- Current medications section of the mobility assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    polypharmacy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polypharmacy IN ('yes', 'no', '')),
    total_medication_count INTEGER
        CHECK (total_medication_count IS NULL OR total_medication_count >= 0),
    fall_risk_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fall_risk_medications IN ('yes', 'no', '')),
    sedatives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sedatives IN ('yes', 'no', '')),
    antihypertensives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihypertensives IN ('yes', 'no', '')),
    diuretics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diuretics IN ('yes', 'no', '')),
    psychotropics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychotropics IN ('yes', 'no', '')),
    opioids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (opioids IN ('yes', 'no', '')),
    anticonvulsants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticonvulsants IN ('yes', 'no', '')),
    postural_hypotension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (postural_hypotension IN ('yes', 'no', '')),
    recent_medication_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_medication_changes IN ('yes', 'no', '')),
    medication_change_details TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: polypharmacy, fall-risk medications, and postural hypotension. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.polypharmacy IS
    'Whether the patient takes 5 or more medications (polypharmacy): yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.total_medication_count IS
    'Total number of prescribed medications.';
COMMENT ON COLUMN assessment_current_medications.fall_risk_medications IS
    'Whether the patient takes medications associated with fall risk: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.sedatives IS
    'Whether the patient takes sedative medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.antihypertensives IS
    'Whether the patient takes antihypertensive medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.diuretics IS
    'Whether the patient takes diuretics: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.psychotropics IS
    'Whether the patient takes psychotropic medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.opioids IS
    'Whether the patient takes opioid medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.anticonvulsants IS
    'Whether the patient takes anticonvulsant medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.postural_hypotension IS
    'Whether the patient has postural (orthostatic) hypotension: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.recent_medication_changes IS
    'Whether there have been recent medication changes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.medication_change_details IS
    'Free-text details of recent medication changes.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Free-text clinician notes on medications and fall risk.';

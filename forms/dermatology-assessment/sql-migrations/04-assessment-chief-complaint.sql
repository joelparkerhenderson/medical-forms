-- 04_assessment_chief_complaint.sql
-- Step 2: Chief complaint section of the dermatology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    onset_date DATE,
    duration VARCHAR(50) NOT NULL DEFAULT '',
    body_area_affected TEXT NOT NULL DEFAULT '',
    symptom_progression VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_progression IN ('improving', 'stable', 'worsening', 'fluctuating', '')),
    pruritus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pruritus IN ('yes', 'no', '')),
    pruritus_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pruritus_severity IN ('mild', 'moderate', 'severe', '')),
    pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain IN ('yes', 'no', '')),
    bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bleeding IN ('yes', 'no', '')),
    previous_treatment TEXT NOT NULL DEFAULT '',
    previous_treatment_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (previous_treatment_response IN ('resolved', 'improved', 'no_change', 'worsened', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Step 2 Chief Complaint: presenting dermatological complaint and symptom characteristics. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Free-text description of the patient primary skin complaint.';
COMMENT ON COLUMN assessment_chief_complaint.onset_date IS
    'Date when the skin condition first appeared, NULL if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.duration IS
    'Duration description of the complaint.';
COMMENT ON COLUMN assessment_chief_complaint.body_area_affected IS
    'Body areas affected by the skin condition.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_progression IS
    'How the condition has changed over time.';
COMMENT ON COLUMN assessment_chief_complaint.pruritus IS
    'Whether itching is present.';
COMMENT ON COLUMN assessment_chief_complaint.pruritus_severity IS
    'Severity of itching if present.';
COMMENT ON COLUMN assessment_chief_complaint.pain IS
    'Whether the skin condition is painful.';
COMMENT ON COLUMN assessment_chief_complaint.bleeding IS
    'Whether the skin condition involves bleeding.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment IS
    'Previous treatments attempted for this condition.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment_response IS
    'Response to previous treatment.';

-- 04_assessment_chief_complaint.sql
-- Step 2: Chief complaint section of the gastroenterology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    onset_date DATE,
    duration VARCHAR(50) NOT NULL DEFAULT '',
    symptom_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_pattern IN ('continuous', 'intermittent', 'episodic', 'progressive', '')),
    severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', '')),
    impact_on_daily_life VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (impact_on_daily_life IN ('none', 'mild', 'moderate', 'severe', '')),
    previous_investigations TEXT NOT NULL DEFAULT '',
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
    'Step 2 Chief Complaint: presenting GI complaint and symptom characteristics. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Free-text description of the patient primary gastrointestinal complaint.';
COMMENT ON COLUMN assessment_chief_complaint.onset_date IS
    'Date when the complaint first appeared, NULL if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.duration IS
    'Duration description of the complaint.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_pattern IS
    'Temporal pattern of symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.severity IS
    'Subjective severity of the complaint.';
COMMENT ON COLUMN assessment_chief_complaint.impact_on_daily_life IS
    'Impact of symptoms on daily activities.';
COMMENT ON COLUMN assessment_chief_complaint.previous_investigations IS
    'Previous GI investigations performed (e.g. endoscopy, colonoscopy).';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment IS
    'Previous treatments attempted for this complaint.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment_response IS
    'Response to previous treatment.';

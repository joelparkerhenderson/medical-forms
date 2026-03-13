-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the urology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    symptom_onset_date DATE,
    symptom_duration_weeks INTEGER
        CHECK (symptom_duration_weeks IS NULL OR symptom_duration_weeks >= 0),
    symptom_progression VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_progression IN ('stable', 'worsening', 'improving', 'fluctuating', '')),
    previous_urological_evaluation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_urological_evaluation IN ('yes', 'no', '')),
    previous_evaluation_details TEXT NOT NULL DEFAULT '',
    impact_on_quality_of_life VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_quality_of_life IN ('none', 'mild', 'moderate', 'severe', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting urological symptoms and prior evaluation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Free-text description of the primary urological complaint.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_onset_date IS
    'Date when symptoms first appeared.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_duration_weeks IS
    'Duration of symptoms in weeks.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_progression IS
    'Pattern of symptom progression: stable, worsening, improving, fluctuating, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.previous_urological_evaluation IS
    'Whether patient has had a previous urological evaluation.';
COMMENT ON COLUMN assessment_chief_complaint.previous_evaluation_details IS
    'Details of previous urological evaluations.';
COMMENT ON COLUMN assessment_chief_complaint.impact_on_quality_of_life IS
    'Impact of symptoms on quality of life: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.additional_notes IS
    'Free-text additional notes about the chief complaint.';

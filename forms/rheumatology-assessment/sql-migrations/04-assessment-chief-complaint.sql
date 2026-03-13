-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the rheumatology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    symptom_onset_date DATE,
    symptom_duration_weeks INTEGER
        CHECK (symptom_duration_weeks IS NULL OR symptom_duration_weeks >= 0),
    symptom_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (symptom_pattern IN ('constant', 'intermittent', 'progressive', 'relapsing_remitting', '')),
    morning_stiffness_duration_minutes INTEGER
        CHECK (morning_stiffness_duration_minutes IS NULL OR morning_stiffness_duration_minutes >= 0),
    pain_severity INTEGER
        CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    fatigue_severity INTEGER
        CHECK (fatigue_severity IS NULL OR (fatigue_severity >= 0 AND fatigue_severity <= 10)),
    patient_global_assessment INTEGER
        CHECK (patient_global_assessment IS NULL OR (patient_global_assessment >= 0 AND patient_global_assessment <= 100)),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting symptoms, onset timing, and patient-reported severity. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Free-text description of the primary complaint.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_onset_date IS
    'Date when symptoms first appeared.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_duration_weeks IS
    'Duration of symptoms in weeks.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_pattern IS
    'Pattern of symptoms: constant, intermittent, progressive, relapsing_remitting, or empty string if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.morning_stiffness_duration_minutes IS
    'Duration of morning stiffness in minutes; key DAS28 correlate.';
COMMENT ON COLUMN assessment_chief_complaint.pain_severity IS
    'Patient-reported pain severity on a 0-10 Visual Analogue Scale.';
COMMENT ON COLUMN assessment_chief_complaint.fatigue_severity IS
    'Patient-reported fatigue severity on a 0-10 Visual Analogue Scale.';
COMMENT ON COLUMN assessment_chief_complaint.patient_global_assessment IS
    'Patient global assessment of disease activity on a 0-100 VAS (mm); used in DAS28 calculation.';
COMMENT ON COLUMN assessment_chief_complaint.additional_notes IS
    'Free-text additional notes about the chief complaint.';

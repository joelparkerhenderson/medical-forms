-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the neurology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    symptom_onset_date DATE,
    symptom_onset_time VARCHAR(10) NOT NULL DEFAULT '',
    onset_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_type IN ('sudden', 'gradual', 'progressive', 'fluctuating', '')),
    symptom_duration VARCHAR(50) NOT NULL DEFAULT '',
    symptom_laterality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (symptom_laterality IN ('left', 'right', 'bilateral', '')),
    headache VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (headache IN ('yes', 'no', '')),
    weakness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (weakness IN ('yes', 'no', '')),
    numbness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (numbness IN ('yes', 'no', '')),
    speech_difficulty VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (speech_difficulty IN ('yes', 'no', '')),
    vision_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_changes IN ('yes', 'no', '')),
    dizziness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dizziness IN ('yes', 'no', '')),
    seizure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure IN ('yes', 'no', '')),
    loss_of_consciousness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (loss_of_consciousness IN ('yes', 'no', '')),
    previous_neurological_history TEXT NOT NULL DEFAULT '',
    chief_complaint_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting neurological symptoms, onset, duration, and laterality. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Free-text description of the chief complaint.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_onset_date IS
    'Date of symptom onset.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_onset_time IS
    'Time of symptom onset (HH:MM format), critical for stroke assessment.';
COMMENT ON COLUMN assessment_chief_complaint.onset_type IS
    'Onset type: sudden, gradual, progressive, fluctuating, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_duration IS
    'Duration of symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_laterality IS
    'Side of symptom predominance: left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.headache IS
    'Whether the patient presents with headache: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.weakness IS
    'Whether the patient presents with weakness: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.numbness IS
    'Whether the patient presents with numbness or paraesthesia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.speech_difficulty IS
    'Whether the patient presents with speech difficulty: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.vision_changes IS
    'Whether the patient presents with vision changes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.dizziness IS
    'Whether the patient presents with dizziness or vertigo: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.seizure IS
    'Whether the patient presents with seizure: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.loss_of_consciousness IS
    'Whether the patient experienced loss of consciousness: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.previous_neurological_history IS
    'Free-text description of previous neurological history.';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint_notes IS
    'Free-text clinician notes on the chief complaint.';

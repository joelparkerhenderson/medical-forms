-- 08_assessment_current_symptoms.sql
-- Step 6: Current musculoskeletal symptoms section of the ergonomic assessment.

CREATE TABLE assessment_current_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    neck_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neck_pain IN ('yes', 'no', '')),
    neck_pain_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (neck_pain_severity IN ('mild', 'moderate', 'severe', '')),
    neck_pain_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (neck_pain_frequency IN ('occasional', 'frequent', 'constant', '')),
    shoulder_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shoulder_pain IN ('yes', 'no', '')),
    shoulder_pain_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (shoulder_pain_side IN ('left', 'right', 'both', '')),
    upper_back_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (upper_back_pain IN ('yes', 'no', '')),
    lower_back_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lower_back_pain IN ('yes', 'no', '')),
    lower_back_pain_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (lower_back_pain_severity IN ('mild', 'moderate', 'severe', '')),
    wrist_hand_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wrist_hand_pain IN ('yes', 'no', '')),
    wrist_hand_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (wrist_hand_side IN ('left', 'right', 'both', '')),
    elbow_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (elbow_pain IN ('yes', 'no', '')),
    hip_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hip_pain IN ('yes', 'no', '')),
    knee_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (knee_pain IN ('yes', 'no', '')),
    tingling_numbness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tingling_numbness IN ('yes', 'no', '')),
    tingling_location TEXT NOT NULL DEFAULT '',
    symptoms_worse_at_work VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (symptoms_worse_at_work IN ('yes', 'no', '')),
    symptoms_improve_off_work VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (symptoms_improve_off_work IN ('yes', 'no', '')),
    days_lost_last_year INTEGER
        CHECK (days_lost_last_year IS NULL OR days_lost_last_year >= 0),
    visual_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (visual_symptoms IN ('yes', 'no', '')),
    visual_symptom_details TEXT NOT NULL DEFAULT '',
    headaches VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (headaches IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_symptoms_updated_at
    BEFORE UPDATE ON assessment_current_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_symptoms IS
    'Step 6 Current Symptoms: musculoskeletal symptoms by body region. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_symptoms.neck_pain IS
    'Whether the patient experiences neck pain.';
COMMENT ON COLUMN assessment_current_symptoms.neck_pain_severity IS
    'Severity of neck pain.';
COMMENT ON COLUMN assessment_current_symptoms.neck_pain_frequency IS
    'Frequency of neck pain episodes.';
COMMENT ON COLUMN assessment_current_symptoms.shoulder_pain IS
    'Whether the patient experiences shoulder pain.';
COMMENT ON COLUMN assessment_current_symptoms.shoulder_pain_side IS
    'Which shoulder is affected.';
COMMENT ON COLUMN assessment_current_symptoms.upper_back_pain IS
    'Whether the patient experiences upper back (thoracic) pain.';
COMMENT ON COLUMN assessment_current_symptoms.lower_back_pain IS
    'Whether the patient experiences lower back (lumbar) pain.';
COMMENT ON COLUMN assessment_current_symptoms.lower_back_pain_severity IS
    'Severity of lower back pain.';
COMMENT ON COLUMN assessment_current_symptoms.wrist_hand_pain IS
    'Whether the patient experiences wrist or hand pain.';
COMMENT ON COLUMN assessment_current_symptoms.wrist_hand_side IS
    'Which wrist or hand is affected.';
COMMENT ON COLUMN assessment_current_symptoms.elbow_pain IS
    'Whether the patient experiences elbow pain.';
COMMENT ON COLUMN assessment_current_symptoms.hip_pain IS
    'Whether the patient experiences hip pain.';
COMMENT ON COLUMN assessment_current_symptoms.knee_pain IS
    'Whether the patient experiences knee pain.';
COMMENT ON COLUMN assessment_current_symptoms.tingling_numbness IS
    'Whether the patient experiences tingling or numbness (nerve compression sign).';
COMMENT ON COLUMN assessment_current_symptoms.tingling_location IS
    'Location of tingling or numbness.';
COMMENT ON COLUMN assessment_current_symptoms.symptoms_worse_at_work IS
    'Whether symptoms worsen at work (work-relatedness indicator).';
COMMENT ON COLUMN assessment_current_symptoms.symptoms_improve_off_work IS
    'Whether symptoms improve away from work.';
COMMENT ON COLUMN assessment_current_symptoms.days_lost_last_year IS
    'Number of work days lost to musculoskeletal symptoms in the past year.';
COMMENT ON COLUMN assessment_current_symptoms.visual_symptoms IS
    'Whether the patient experiences visual symptoms (eye strain, blurred vision).';
COMMENT ON COLUMN assessment_current_symptoms.visual_symptom_details IS
    'Details of visual symptoms.';
COMMENT ON COLUMN assessment_current_symptoms.headaches IS
    'Whether the patient experiences work-related headaches.';
COMMENT ON COLUMN assessment_current_symptoms.additional_notes IS
    'Additional notes about current symptoms.';

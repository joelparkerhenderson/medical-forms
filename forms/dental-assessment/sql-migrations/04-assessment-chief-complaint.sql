-- 04_assessment_chief_complaint.sql
-- Step 2: Chief complaint section of the dental assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    onset_date DATE,
    duration VARCHAR(50) NOT NULL DEFAULT '',
    severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', '')),
    pain_location TEXT NOT NULL DEFAULT '',
    pain_character VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (pain_character IN ('sharp', 'dull', 'throbbing', 'constant', 'intermittent', '')),
    aggravating_factors TEXT NOT NULL DEFAULT '',
    relieving_factors TEXT NOT NULL DEFAULT '',
    previous_treatment TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Step 2 Chief Complaint: presenting dental complaint and pain characteristics. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Free-text description of the patient primary dental complaint.';
COMMENT ON COLUMN assessment_chief_complaint.onset_date IS
    'Date when the complaint first appeared, NULL if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.duration IS
    'Duration description of the complaint.';
COMMENT ON COLUMN assessment_chief_complaint.severity IS
    'Subjective severity: mild, moderate, severe, or empty if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.pain_location IS
    'Anatomical location of pain (e.g. upper left molar).';
COMMENT ON COLUMN assessment_chief_complaint.pain_character IS
    'Character of pain: sharp, dull, throbbing, constant, intermittent, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.aggravating_factors IS
    'Factors that worsen the complaint (e.g. hot/cold, biting).';
COMMENT ON COLUMN assessment_chief_complaint.relieving_factors IS
    'Factors that relieve the complaint.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment IS
    'Any previous treatment received for this complaint.';

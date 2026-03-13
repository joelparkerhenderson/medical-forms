-- 03_assessment_chief_complaint.sql
-- Chief complaint section of the respirology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset IN ('acute', 'subacute', 'chronic', '')),
    duration TEXT NOT NULL DEFAULT '',
    severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', '')),
    dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspnoea IN ('yes', 'no', '')),
    cough VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cough IN ('yes', 'no', '')),
    wheeze VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wheeze IN ('yes', 'no', '')),
    chest_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_pain IN ('yes', 'no', '')),
    haemoptysis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haemoptysis IN ('yes', 'no', '')),
    recurrent_respiratory_infections VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recurrent_respiratory_infections IN ('yes', 'no', '')),
    weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (weight_loss IN ('yes', 'no', '')),
    night_sweats VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (night_sweats IN ('yes', 'no', '')),
    fever VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fever IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting respiratory symptoms, onset, and severity. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Primary presenting respiratory complaint.';
COMMENT ON COLUMN assessment_chief_complaint.onset IS
    'Onset of symptoms: acute, subacute, chronic, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.severity IS
    'Current severity: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.dyspnoea IS
    'Whether the patient experiences dyspnoea (breathlessness).';
COMMENT ON COLUMN assessment_chief_complaint.cough IS
    'Whether the patient has a cough.';
COMMENT ON COLUMN assessment_chief_complaint.wheeze IS
    'Whether the patient experiences wheezing.';
COMMENT ON COLUMN assessment_chief_complaint.chest_pain IS
    'Whether the patient has chest pain.';
COMMENT ON COLUMN assessment_chief_complaint.haemoptysis IS
    'Whether the patient has haemoptysis (coughing up blood).';
COMMENT ON COLUMN assessment_chief_complaint.recurrent_respiratory_infections IS
    'Whether the patient has recurrent respiratory infections.';

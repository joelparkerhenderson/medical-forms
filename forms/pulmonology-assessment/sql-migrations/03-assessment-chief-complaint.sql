-- 03_assessment_chief_complaint.sql
-- Chief complaint section of the pulmonology assessment.

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
    dyspnoea_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dyspnoea_onset IN ('rest', 'exertion', 'nocturnal', 'positional', '')),
    cough VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cough IN ('yes', 'no', '')),
    cough_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cough_type IN ('dry', 'productive', 'haemoptysis', '')),
    sputum_production VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sputum_production IN ('yes', 'no', '')),
    sputum_colour VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sputum_colour IN ('clear', 'white', 'yellow', 'green', 'brown', 'blood-tinged', '')),
    wheeze VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wheeze IN ('yes', 'no', '')),
    chest_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_pain IN ('yes', 'no', '')),
    chest_pain_character VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (chest_pain_character IN ('pleuritic', 'central', 'musculoskeletal', 'other', '')),
    weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (weight_loss IN ('yes', 'no', '')),
    night_sweats VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (night_sweats IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting respiratory symptoms, onset, severity, and character. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint IS
    'Primary presenting respiratory complaint.';
COMMENT ON COLUMN assessment_chief_complaint.onset IS
    'Onset of symptoms: acute, subacute, chronic, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.dyspnoea IS
    'Whether the patient experiences dyspnoea (breathlessness).';
COMMENT ON COLUMN assessment_chief_complaint.dyspnoea_onset IS
    'Circumstances of dyspnoea: rest, exertion, nocturnal, positional, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.cough IS
    'Whether the patient has a cough.';
COMMENT ON COLUMN assessment_chief_complaint.cough_type IS
    'Type of cough: dry, productive, haemoptysis, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.sputum_production IS
    'Whether the patient produces sputum.';
COMMENT ON COLUMN assessment_chief_complaint.sputum_colour IS
    'Colour of sputum: clear, white, yellow, green, brown, blood-tinged, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.chest_pain IS
    'Whether the patient has chest pain.';
COMMENT ON COLUMN assessment_chief_complaint.chest_pain_character IS
    'Character of chest pain: pleuritic, central, musculoskeletal, other, or empty.';

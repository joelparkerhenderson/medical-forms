-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the ophthalmology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset IN ('sudden', 'gradual', 'intermittent', '')),
    duration TEXT NOT NULL DEFAULT '',
    laterality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (laterality IN ('left', 'right', 'both', '')),
    associated_symptoms TEXT NOT NULL DEFAULT '',
    pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain IN ('yes', 'no', '')),
    pain_severity INTEGER
        CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    pain_character VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pain_character IN ('aching', 'sharp', 'throbbing', 'burning', 'foreign-body', 'pressure', '')),
    photophobia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (photophobia IN ('yes', 'no', '')),
    discharge VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (discharge IN ('yes', 'no', '')),
    discharge_description TEXT NOT NULL DEFAULT '',
    flashes_or_floaters VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flashes_or_floaters IN ('yes', 'no', '')),
    flashes_floaters_details TEXT NOT NULL DEFAULT '',
    vision_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_loss IN ('yes', 'no', '')),
    vision_loss_details TEXT NOT NULL DEFAULT '',
    chief_complaint_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting symptoms, onset, laterality, pain, and associated features. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Primary reason for the ophthalmic consultation.';
COMMENT ON COLUMN assessment_chief_complaint.onset IS
    'Onset of symptoms: sudden, gradual, intermittent, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.duration IS
    'Duration of symptoms (free text, e.g. 2 weeks, 3 months).';
COMMENT ON COLUMN assessment_chief_complaint.laterality IS
    'Which eye is affected: left, right, both, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.associated_symptoms IS
    'Associated symptoms beyond the primary complaint.';
COMMENT ON COLUMN assessment_chief_complaint.pain IS
    'Whether ocular pain is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.pain_severity IS
    'Pain severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_chief_complaint.pain_character IS
    'Character of pain: aching, sharp, throbbing, burning, foreign-body, pressure, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.photophobia IS
    'Whether photophobia (light sensitivity) is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.discharge IS
    'Whether ocular discharge is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.discharge_description IS
    'Description of discharge type and character if present.';
COMMENT ON COLUMN assessment_chief_complaint.flashes_or_floaters IS
    'Whether flashes or floaters are present: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.flashes_floaters_details IS
    'Details of flashes or floaters if present.';
COMMENT ON COLUMN assessment_chief_complaint.vision_loss IS
    'Whether vision loss is reported: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.vision_loss_details IS
    'Details of vision loss if reported.';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint_notes IS
    'Additional clinician notes on the chief complaint.';

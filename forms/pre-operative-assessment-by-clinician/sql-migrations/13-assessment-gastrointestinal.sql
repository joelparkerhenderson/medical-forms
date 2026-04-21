-- 13-assessment-gastrointestinal.sql
-- Step 11: gastrointestinal examination and fasting status.

CREATE TABLE assessment_gastrointestinal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    abdominal_exam VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (abdominal_exam IN ('normal', 'distended', 'tender', 'organomegaly', 'other', '')),
    abdominal_notes TEXT NOT NULL DEFAULT '',

    reflux_symptoms VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reflux_symptoms IN ('none', 'occasional', 'frequent', 'severe', '')),
    hiatus_hernia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hiatus_hernia IN ('yes', 'no', '')),
    previous_gastric_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gastric_surgery IN ('yes', 'no', '')),

    ng_tube VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ng_tube IN ('yes', 'no', '')),
    stoma VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stoma IN ('none', 'colostomy', 'ileostomy', 'urostomy', 'gastrostomy', '')),

    fasting_confirmed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fasting_confirmed IN ('yes', 'no', '')),
    last_solid_food_at TIMESTAMPTZ,
    last_clear_fluid_at TIMESTAMPTZ,

    rapid_sequence_induction_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rapid_sequence_induction_needed IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gastrointestinal_updated_at
    BEFORE UPDATE ON assessment_gastrointestinal
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gastrointestinal IS
    'Step 11: gastrointestinal examination, reflux and fasting status, and aspiration risk.';
COMMENT ON COLUMN assessment_gastrointestinal.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_gastrointestinal.abdominal_exam IS
    'Abdominal examination summary: normal, distended, tender, organomegaly, other.';
COMMENT ON COLUMN assessment_gastrointestinal.abdominal_notes IS
    'Free-text abdominal examination notes.';
COMMENT ON COLUMN assessment_gastrointestinal.reflux_symptoms IS
    'Reflux severity: none, occasional, frequent, severe.';
COMMENT ON COLUMN assessment_gastrointestinal.hiatus_hernia IS
    'Known hiatus hernia.';
COMMENT ON COLUMN assessment_gastrointestinal.previous_gastric_surgery IS
    'Previous gastric or bariatric surgery.';
COMMENT ON COLUMN assessment_gastrointestinal.ng_tube IS
    'Presence of a nasogastric tube.';
COMMENT ON COLUMN assessment_gastrointestinal.stoma IS
    'Stoma type: none, colostomy, ileostomy, urostomy, gastrostomy.';
COMMENT ON COLUMN assessment_gastrointestinal.fasting_confirmed IS
    'Whether fasting requirements are confirmed to be met.';
COMMENT ON COLUMN assessment_gastrointestinal.last_solid_food_at IS
    'Timestamp of last solid food intake.';
COMMENT ON COLUMN assessment_gastrointestinal.last_clear_fluid_at IS
    'Timestamp of last clear fluid intake.';
COMMENT ON COLUMN assessment_gastrointestinal.rapid_sequence_induction_needed IS
    'Clinician assessment that RSI is indicated.';

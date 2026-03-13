-- 05_assessment_level_of_consciousness.sql
-- Level of consciousness section of the stroke assessment (NIHSS items 1a-1c).

CREATE TABLE assessment_level_of_consciousness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 1a: Level of consciousness
    nihss_1a_loc INTEGER
        CHECK (nihss_1a_loc IS NULL OR (nihss_1a_loc >= 0 AND nihss_1a_loc <= 3)),

    -- NIHSS 1b: LOC questions (month and age)
    nihss_1b_loc_questions INTEGER
        CHECK (nihss_1b_loc_questions IS NULL OR (nihss_1b_loc_questions >= 0 AND nihss_1b_loc_questions <= 2)),

    -- NIHSS 1c: LOC commands (open/close eyes, grip/release hand)
    nihss_1c_loc_commands INTEGER
        CHECK (nihss_1c_loc_commands IS NULL OR (nihss_1c_loc_commands >= 0 AND nihss_1c_loc_commands <= 2)),

    gcs_eye INTEGER
        CHECK (gcs_eye IS NULL OR (gcs_eye >= 1 AND gcs_eye <= 4)),
    gcs_verbal INTEGER
        CHECK (gcs_verbal IS NULL OR (gcs_verbal >= 1 AND gcs_verbal <= 5)),
    gcs_motor INTEGER
        CHECK (gcs_motor IS NULL OR (gcs_motor >= 1 AND gcs_motor <= 6)),
    gcs_total INTEGER
        CHECK (gcs_total IS NULL OR (gcs_total >= 3 AND gcs_total <= 15)),
    orientation_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_level_of_consciousness_updated_at
    BEFORE UPDATE ON assessment_level_of_consciousness
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_level_of_consciousness IS
    'Level of consciousness section (NIHSS items 1a-1c): alertness, orientation, and command following. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_level_of_consciousness.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_level_of_consciousness.nihss_1a_loc IS
    'NIHSS 1a: 0=alert, 1=not alert but arousable by minor stimulation, 2=not alert requiring repeated stimulation, 3=unresponsive.';
COMMENT ON COLUMN assessment_level_of_consciousness.nihss_1b_loc_questions IS
    'NIHSS 1b: 0=answers both correctly, 1=answers one correctly, 2=answers neither correctly.';
COMMENT ON COLUMN assessment_level_of_consciousness.nihss_1c_loc_commands IS
    'NIHSS 1c: 0=performs both tasks correctly, 1=performs one task correctly, 2=performs neither task correctly.';
COMMENT ON COLUMN assessment_level_of_consciousness.gcs_eye IS
    'Glasgow Coma Scale eye opening: 1=none, 2=to pressure, 3=to voice, 4=spontaneous.';
COMMENT ON COLUMN assessment_level_of_consciousness.gcs_verbal IS
    'Glasgow Coma Scale verbal response: 1=none, 2=sounds, 3=words, 4=confused, 5=orientated.';
COMMENT ON COLUMN assessment_level_of_consciousness.gcs_motor IS
    'Glasgow Coma Scale motor response: 1=none, 2=extension, 3=abnormal flexion, 4=normal flexion, 5=localising, 6=obeys commands.';
COMMENT ON COLUMN assessment_level_of_consciousness.gcs_total IS
    'Glasgow Coma Scale total score (3-15).';
COMMENT ON COLUMN assessment_level_of_consciousness.orientation_notes IS
    'Free-text notes on orientation assessment.';

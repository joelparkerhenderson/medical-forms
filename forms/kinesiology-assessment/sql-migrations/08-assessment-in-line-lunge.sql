-- 08_assessment_in_line_lunge.sql
-- FMS In-Line Lunge test section of the kinesiology assessment.

CREATE TABLE assessment_in_line_lunge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    left_raw_score INTEGER
        CHECK (left_raw_score IS NULL OR (left_raw_score >= 0 AND left_raw_score <= 3)),
    right_raw_score INTEGER
        CHECK (right_raw_score IS NULL OR (right_raw_score >= 0 AND right_raw_score <= 3)),
    pain_noted_left VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_noted_left IN ('yes', 'no', '')),
    pain_noted_right VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_noted_right IN ('yes', 'no', '')),
    final_score INTEGER
        CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 3)),
    dowel_contact_maintained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dowel_contact_maintained IN ('yes', 'no', '')),
    torso_remains_upright VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (torso_remains_upright IN ('yes', 'no', '')),
    knee_touches_board VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (knee_touches_board IN ('yes', 'no', '')),
    foot_alignment_maintained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (foot_alignment_maintained IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_in_line_lunge_updated_at
    BEFORE UPDATE ON assessment_in_line_lunge
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_in_line_lunge IS
    'FMS In-Line Lunge test: assesses hip, knee, ankle, and foot mobility and stability in a split stance. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_in_line_lunge.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_in_line_lunge.left_raw_score IS
    'Raw FMS score for the left-side in-line lunge (0-3).';
COMMENT ON COLUMN assessment_in_line_lunge.right_raw_score IS
    'Raw FMS score for the right-side in-line lunge (0-3).';
COMMENT ON COLUMN assessment_in_line_lunge.pain_noted_left IS
    'Whether pain was noted on the left side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.pain_noted_right IS
    'Whether pain was noted on the right side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.final_score IS
    'Final score: lower of left/right scores, or 0 if pain (0-3).';
COMMENT ON COLUMN assessment_in_line_lunge.dowel_contact_maintained IS
    'Whether the dowel maintained contact with head, thoracic spine, and sacrum: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.torso_remains_upright IS
    'Whether the torso remained upright throughout the lunge: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.knee_touches_board IS
    'Whether the rear knee touched the board behind the front heel: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.foot_alignment_maintained IS
    'Whether foot alignment was maintained on the board: yes, no, or empty string.';
COMMENT ON COLUMN assessment_in_line_lunge.clinician_notes IS
    'Free-text clinician observations for this movement test.';

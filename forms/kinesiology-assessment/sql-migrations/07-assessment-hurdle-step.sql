-- 07_assessment_hurdle_step.sql
-- FMS Hurdle Step test section of the kinesiology assessment.

CREATE TABLE assessment_hurdle_step (
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
    hip_knee_ankle_alignment_left TEXT NOT NULL DEFAULT '',
    hip_knee_ankle_alignment_right TEXT NOT NULL DEFAULT '',
    stance_leg_stable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stance_leg_stable IN ('yes', 'no', '')),
    dowel_position_maintained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dowel_position_maintained IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_hurdle_step_updated_at
    BEFORE UPDATE ON assessment_hurdle_step
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hurdle_step IS
    'FMS Hurdle Step test: assesses bilateral mobility and stability of hips, knees, and ankles. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_hurdle_step.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_hurdle_step.left_raw_score IS
    'Raw FMS score for the left-side hurdle step (0-3).';
COMMENT ON COLUMN assessment_hurdle_step.right_raw_score IS
    'Raw FMS score for the right-side hurdle step (0-3).';
COMMENT ON COLUMN assessment_hurdle_step.pain_noted_left IS
    'Whether pain was noted on the left side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hurdle_step.pain_noted_right IS
    'Whether pain was noted on the right side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hurdle_step.final_score IS
    'Final score: lower of left/right scores, or 0 if pain (0-3).';
COMMENT ON COLUMN assessment_hurdle_step.hip_knee_ankle_alignment_left IS
    'Observation of left-side hip-knee-ankle alignment during the step.';
COMMENT ON COLUMN assessment_hurdle_step.hip_knee_ankle_alignment_right IS
    'Observation of right-side hip-knee-ankle alignment during the step.';
COMMENT ON COLUMN assessment_hurdle_step.stance_leg_stable IS
    'Whether the stance leg remained stable: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hurdle_step.dowel_position_maintained IS
    'Whether the dowel position was maintained across the shoulders: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hurdle_step.clinician_notes IS
    'Free-text clinician observations for this movement test.';

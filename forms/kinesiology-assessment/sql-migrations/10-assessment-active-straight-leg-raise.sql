-- 10_assessment_active_straight_leg_raise.sql
-- FMS Active Straight Leg Raise test section of the kinesiology assessment.

CREATE TABLE assessment_active_straight_leg_raise (
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
    malleolus_position_left VARCHAR(50) NOT NULL DEFAULT '',
    malleolus_position_right VARCHAR(50) NOT NULL DEFAULT '',
    opposite_leg_remains_flat VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (opposite_leg_remains_flat IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_active_straight_leg_raise_updated_at
    BEFORE UPDATE ON assessment_active_straight_leg_raise
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_active_straight_leg_raise IS
    'FMS Active Straight Leg Raise test: assesses hamstring and gastro-soleus flexibility while maintaining a stable pelvis. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_active_straight_leg_raise.left_raw_score IS
    'Raw FMS score for the left-side active straight leg raise (0-3).';
COMMENT ON COLUMN assessment_active_straight_leg_raise.right_raw_score IS
    'Raw FMS score for the right-side active straight leg raise (0-3).';
COMMENT ON COLUMN assessment_active_straight_leg_raise.pain_noted_left IS
    'Whether pain was noted on the left side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.pain_noted_right IS
    'Whether pain was noted on the right side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.final_score IS
    'Final score: lower of left/right scores, or 0 if pain (0-3).';
COMMENT ON COLUMN assessment_active_straight_leg_raise.malleolus_position_left IS
    'Position of the left malleolus relative to the mid-thigh landmark during the raise.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.malleolus_position_right IS
    'Position of the right malleolus relative to the mid-thigh landmark during the raise.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.opposite_leg_remains_flat IS
    'Whether the non-test leg remained flat on the floor: yes, no, or empty string.';
COMMENT ON COLUMN assessment_active_straight_leg_raise.clinician_notes IS
    'Free-text clinician observations for this movement test.';

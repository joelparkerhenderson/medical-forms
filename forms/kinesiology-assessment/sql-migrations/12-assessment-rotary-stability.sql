-- 12_assessment_rotary_stability.sql
-- FMS Rotary Stability test section of the kinesiology assessment.

CREATE TABLE assessment_rotary_stability (
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
    clearing_test_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clearing_test_pain IN ('yes', 'no', '')),
    final_score INTEGER
        CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 3)),
    unilateral_pattern_achieved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unilateral_pattern_achieved IN ('yes', 'no', '')),
    diagonal_pattern_achieved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diagonal_pattern_achieved IN ('yes', 'no', '')),
    trunk_rotation_noted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trunk_rotation_noted IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_rotary_stability_updated_at
    BEFORE UPDATE ON assessment_rotary_stability
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_rotary_stability IS
    'FMS Rotary Stability test: assesses multi-plane trunk stability during combined upper and lower extremity motion. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_rotary_stability.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_rotary_stability.left_raw_score IS
    'Raw FMS score for the left-side rotary stability (0-3).';
COMMENT ON COLUMN assessment_rotary_stability.right_raw_score IS
    'Raw FMS score for the right-side rotary stability (0-3).';
COMMENT ON COLUMN assessment_rotary_stability.pain_noted_left IS
    'Whether pain was noted on the left side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.pain_noted_right IS
    'Whether pain was noted on the right side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.clearing_test_pain IS
    'Whether the spinal flexion clearing test produced pain: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.final_score IS
    'Final score: lower of left/right scores, or 0 if clearing test pain (0-3).';
COMMENT ON COLUMN assessment_rotary_stability.unilateral_pattern_achieved IS
    'Whether the unilateral (ipsilateral) pattern was achieved: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.diagonal_pattern_achieved IS
    'Whether the diagonal (contralateral) pattern was achieved: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.trunk_rotation_noted IS
    'Whether excessive trunk rotation was observed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_rotary_stability.clinician_notes IS
    'Free-text clinician observations for this movement test.';

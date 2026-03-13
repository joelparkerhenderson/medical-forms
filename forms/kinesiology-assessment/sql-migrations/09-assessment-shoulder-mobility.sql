-- 09_assessment_shoulder_mobility.sql
-- FMS Shoulder Mobility test section of the kinesiology assessment.

CREATE TABLE assessment_shoulder_mobility (
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
    clearing_test_pain_left VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clearing_test_pain_left IN ('yes', 'no', '')),
    clearing_test_pain_right VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clearing_test_pain_right IN ('yes', 'no', '')),
    final_score INTEGER
        CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 3)),
    hand_distance_cm NUMERIC(5,1),
    hand_span_length_cm NUMERIC(5,1),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_shoulder_mobility_updated_at
    BEFORE UPDATE ON assessment_shoulder_mobility
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_shoulder_mobility IS
    'FMS Shoulder Mobility test: assesses bilateral shoulder range of motion including internal and external rotation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_shoulder_mobility.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_shoulder_mobility.left_raw_score IS
    'Raw FMS score for the left-side shoulder mobility (0-3).';
COMMENT ON COLUMN assessment_shoulder_mobility.right_raw_score IS
    'Raw FMS score for the right-side shoulder mobility (0-3).';
COMMENT ON COLUMN assessment_shoulder_mobility.pain_noted_left IS
    'Whether pain was noted on the left side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_shoulder_mobility.pain_noted_right IS
    'Whether pain was noted on the right side: yes, no, or empty string.';
COMMENT ON COLUMN assessment_shoulder_mobility.clearing_test_pain_left IS
    'Whether the impingement clearing test produced pain on the left: yes, no, or empty string.';
COMMENT ON COLUMN assessment_shoulder_mobility.clearing_test_pain_right IS
    'Whether the impingement clearing test produced pain on the right: yes, no, or empty string.';
COMMENT ON COLUMN assessment_shoulder_mobility.final_score IS
    'Final score: lower of left/right scores, or 0 if clearing test pain (0-3).';
COMMENT ON COLUMN assessment_shoulder_mobility.hand_distance_cm IS
    'Distance between the two fists in centimetres during the test.';
COMMENT ON COLUMN assessment_shoulder_mobility.hand_span_length_cm IS
    'Patient hand span length in centimetres, used to normalise the distance.';
COMMENT ON COLUMN assessment_shoulder_mobility.clinician_notes IS
    'Free-text clinician observations for this movement test.';

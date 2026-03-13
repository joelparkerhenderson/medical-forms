-- 06_assessment_deep_squat.sql
-- FMS Deep Squat test section of the kinesiology assessment.

CREATE TABLE assessment_deep_squat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    raw_score INTEGER
        CHECK (raw_score IS NULL OR (raw_score >= 0 AND raw_score <= 3)),
    pain_noted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_noted IN ('yes', 'no', '')),
    clearing_test_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clearing_test_pain IN ('yes', 'no', '')),
    final_score INTEGER
        CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 3)),
    upper_torso_alignment TEXT NOT NULL DEFAULT '',
    femur_below_horizontal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (femur_below_horizontal IN ('yes', 'no', '')),
    knees_over_feet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (knees_over_feet IN ('yes', 'no', '')),
    heels_on_floor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heels_on_floor IN ('yes', 'no', '')),
    dowel_overhead VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dowel_overhead IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_deep_squat_updated_at
    BEFORE UPDATE ON assessment_deep_squat
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_deep_squat IS
    'FMS Deep Squat test: assesses bilateral symmetrical mobility of hips, knees, and ankles. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_deep_squat.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_deep_squat.raw_score IS
    'Raw FMS score for the deep squat (0-3).';
COMMENT ON COLUMN assessment_deep_squat.pain_noted IS
    'Whether pain was noted during the movement: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.clearing_test_pain IS
    'Whether pain was noted during the clearing test: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.final_score IS
    'Final score after applying clearing test result (0 if pain, otherwise raw_score).';
COMMENT ON COLUMN assessment_deep_squat.upper_torso_alignment IS
    'Observation of upper torso alignment during the squat.';
COMMENT ON COLUMN assessment_deep_squat.femur_below_horizontal IS
    'Whether the femur descended below horizontal: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.knees_over_feet IS
    'Whether the knees tracked over the feet: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.heels_on_floor IS
    'Whether the heels remained on the floor: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.dowel_overhead IS
    'Whether the dowel was maintained overhead: yes, no, or empty string.';
COMMENT ON COLUMN assessment_deep_squat.clinician_notes IS
    'Free-text clinician observations for this movement test.';

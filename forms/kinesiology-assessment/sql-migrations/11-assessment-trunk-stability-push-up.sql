-- 11_assessment_trunk_stability_push_up.sql
-- FMS Trunk Stability Push-Up test section of the kinesiology assessment.

CREATE TABLE assessment_trunk_stability_push_up (
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
    hand_position VARCHAR(50) NOT NULL DEFAULT '',
    body_lifts_as_unit VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (body_lifts_as_unit IN ('yes', 'no', '')),
    spine_sag_noted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (spine_sag_noted IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_trunk_stability_push_up_updated_at
    BEFORE UPDATE ON assessment_trunk_stability_push_up
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_trunk_stability_push_up IS
    'FMS Trunk Stability Push-Up test: assesses trunk stability in the sagittal plane during a push-up motion. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_trunk_stability_push_up.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_trunk_stability_push_up.raw_score IS
    'Raw FMS score for the trunk stability push-up (0-3).';
COMMENT ON COLUMN assessment_trunk_stability_push_up.pain_noted IS
    'Whether pain was noted during the movement: yes, no, or empty string.';
COMMENT ON COLUMN assessment_trunk_stability_push_up.clearing_test_pain IS
    'Whether the spinal extension clearing test produced pain: yes, no, or empty string.';
COMMENT ON COLUMN assessment_trunk_stability_push_up.final_score IS
    'Final score after applying clearing test result (0 if pain, otherwise raw_score).';
COMMENT ON COLUMN assessment_trunk_stability_push_up.hand_position IS
    'Hand position used during the test (e.g. thumbs at chin, thumbs at forehead).';
COMMENT ON COLUMN assessment_trunk_stability_push_up.body_lifts_as_unit IS
    'Whether the body lifted as a unit without segmental movement: yes, no, or empty string.';
COMMENT ON COLUMN assessment_trunk_stability_push_up.spine_sag_noted IS
    'Whether lumbar spine sag was observed during the push-up: yes, no, or empty string.';
COMMENT ON COLUMN assessment_trunk_stability_push_up.clinician_notes IS
    'Free-text clinician observations for this movement test.';

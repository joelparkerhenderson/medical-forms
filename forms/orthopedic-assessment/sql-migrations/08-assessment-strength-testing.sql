-- 08_assessment_strength_testing.sql
-- Strength testing section of the orthopaedic assessment.

CREATE TABLE assessment_strength_testing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    grip_strength_affected_kg NUMERIC(5,1)
        CHECK (grip_strength_affected_kg IS NULL OR grip_strength_affected_kg >= 0),
    grip_strength_unaffected_kg NUMERIC(5,1)
        CHECK (grip_strength_unaffected_kg IS NULL OR grip_strength_unaffected_kg >= 0),
    overall_strength_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_strength_status IN ('normal', 'mildly-reduced', 'moderately-reduced', 'severely-reduced', '')),
    strength_testing_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_strength_testing_updated_at
    BEFORE UPDATE ON assessment_strength_testing
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_strength_testing IS
    'Strength testing section header: grip strength and overall status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_strength_testing.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_strength_testing.grip_strength_affected_kg IS
    'Grip strength of the affected side in kilograms.';
COMMENT ON COLUMN assessment_strength_testing.grip_strength_unaffected_kg IS
    'Grip strength of the unaffected side in kilograms.';
COMMENT ON COLUMN assessment_strength_testing.overall_strength_status IS
    'Overall strength assessment: normal, mildly-reduced, moderately-reduced, severely-reduced, or empty.';
COMMENT ON COLUMN assessment_strength_testing.strength_testing_notes IS
    'Additional notes on strength testing.';

-- Individual muscle strength tests (one-to-many child)
CREATE TABLE assessment_strength_test_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    strength_testing_id UUID NOT NULL
        REFERENCES assessment_strength_testing(id) ON DELETE CASCADE,

    muscle_group VARCHAR(100) NOT NULL DEFAULT '',
    movement VARCHAR(100) NOT NULL DEFAULT '',
    mrc_grade INTEGER
        CHECK (mrc_grade IS NULL OR (mrc_grade >= 0 AND mrc_grade <= 5)),
    pain_on_testing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_on_testing IN ('yes', 'no', '')),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_strength_test_item_updated_at
    BEFORE UPDATE ON assessment_strength_test_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_strength_test_item IS
    'Individual manual muscle testing result using MRC scale (0-5).';
COMMENT ON COLUMN assessment_strength_test_item.muscle_group IS
    'Muscle group tested (e.g. deltoid, biceps, quadriceps).';
COMMENT ON COLUMN assessment_strength_test_item.movement IS
    'Movement tested (e.g. shoulder abduction, elbow flexion).';
COMMENT ON COLUMN assessment_strength_test_item.mrc_grade IS
    'MRC muscle strength grade: 0 = no contraction, 1 = flicker, 2 = movement with gravity eliminated, 3 = movement against gravity, 4 = movement against resistance, 5 = normal.';
COMMENT ON COLUMN assessment_strength_test_item.pain_on_testing IS
    'Whether pain occurred during strength testing: yes, no, or empty.';
COMMENT ON COLUMN assessment_strength_test_item.sort_order IS
    'Display order of the item within the list.';

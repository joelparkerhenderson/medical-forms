CREATE TABLE assessment_strength_test_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    strength_testing_id UUID NOT NULL
        REFERENCES assessment_strength_testing(id) ON DELETE CASCADE,
    muscle_group VARCHAR(100) NOT NULL DEFAULT '',
    movement VARCHAR(100) NOT NULL DEFAULT '',
    mrc_grade INTEGER
        CHECK (mrc_grade IS NULL OR (mrc_grade >= 0 AND mrc_grade <= 5)),
    pain_on_testing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_on_testing IN ('yes', 'no', '')),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_strength_test_item_updated_at
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

COMMENT ON COLUMN assessment_strength_testing.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_strength_testing.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_strength_testing.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_strength_test_item.strength_testing_id IS
    'Foreign key to the assessment_strength_testing table.';
COMMENT ON COLUMN assessment_strength_test_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_strength_test_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_strength_test_item.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_strength_test_item.deleted_at IS
    'Timestamp when this row was deleted.';

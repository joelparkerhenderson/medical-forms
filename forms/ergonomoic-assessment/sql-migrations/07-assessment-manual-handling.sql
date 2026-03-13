-- 07_assessment_manual_handling.sql
-- Step 5: Manual handling section of the ergonomic assessment.

CREATE TABLE assessment_manual_handling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    involves_lifting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (involves_lifting IN ('yes', 'no', '')),
    max_lift_weight_kg NUMERIC(5,1)
        CHECK (max_lift_weight_kg IS NULL OR max_lift_weight_kg >= 0),
    lifting_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lifting_frequency IN ('rarely', 'occasionally', 'frequently', 'constantly', '')),
    lifting_height VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (lifting_height IN ('floor_to_waist', 'waist_to_shoulder', 'above_shoulder', 'mixed', '')),
    involves_carrying VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (involves_carrying IN ('yes', 'no', '')),
    carry_distance_metres NUMERIC(6,1)
        CHECK (carry_distance_metres IS NULL OR carry_distance_metres >= 0),
    involves_pushing_pulling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (involves_pushing_pulling IN ('yes', 'no', '')),
    push_pull_force VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (push_pull_force IN ('light', 'moderate', 'heavy', '')),
    two_person_lift_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (two_person_lift_available IN ('yes', 'no', '')),
    mechanical_aids_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mechanical_aids_available IN ('yes', 'no', '')),
    mechanical_aids_details TEXT NOT NULL DEFAULT '',
    load_characteristics TEXT NOT NULL DEFAULT '',
    floor_conditions VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (floor_conditions IN ('even', 'uneven', 'slippery', 'stairs', '')),
    space_constraints VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (space_constraints IN ('yes', 'no', '')),
    manual_handling_training VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (manual_handling_training IN ('yes', 'no', '')),
    training_date DATE,
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_manual_handling_updated_at
    BEFORE UPDATE ON assessment_manual_handling
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_manual_handling IS
    'Step 5 Manual Handling: lifting, carrying, pushing, and pulling activities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_manual_handling.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_manual_handling.involves_lifting IS
    'Whether the job involves lifting.';
COMMENT ON COLUMN assessment_manual_handling.max_lift_weight_kg IS
    'Maximum weight lifted in kilograms.';
COMMENT ON COLUMN assessment_manual_handling.lifting_frequency IS
    'How often lifting is performed.';
COMMENT ON COLUMN assessment_manual_handling.lifting_height IS
    'Height range of lifting activities.';
COMMENT ON COLUMN assessment_manual_handling.involves_carrying IS
    'Whether the job involves carrying loads.';
COMMENT ON COLUMN assessment_manual_handling.carry_distance_metres IS
    'Typical carrying distance in metres.';
COMMENT ON COLUMN assessment_manual_handling.involves_pushing_pulling IS
    'Whether the job involves pushing or pulling.';
COMMENT ON COLUMN assessment_manual_handling.push_pull_force IS
    'Force level required for pushing or pulling.';
COMMENT ON COLUMN assessment_manual_handling.two_person_lift_available IS
    'Whether two-person lifts are available for heavy loads.';
COMMENT ON COLUMN assessment_manual_handling.mechanical_aids_available IS
    'Whether mechanical aids are available (e.g. trolleys, hoists).';
COMMENT ON COLUMN assessment_manual_handling.mechanical_aids_details IS
    'Details of available mechanical aids.';
COMMENT ON COLUMN assessment_manual_handling.load_characteristics IS
    'Characteristics of the load (e.g. bulky, unstable, sharp).';
COMMENT ON COLUMN assessment_manual_handling.floor_conditions IS
    'Floor conditions in the manual handling area.';
COMMENT ON COLUMN assessment_manual_handling.space_constraints IS
    'Whether there are space constraints affecting manual handling.';
COMMENT ON COLUMN assessment_manual_handling.manual_handling_training IS
    'Whether the patient has received manual handling training.';
COMMENT ON COLUMN assessment_manual_handling.training_date IS
    'Date of most recent manual handling training, NULL if unanswered.';
COMMENT ON COLUMN assessment_manual_handling.additional_notes IS
    'Additional notes about manual handling activities.';

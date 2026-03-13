-- 09_assessment_functional_limitations.sql
-- Functional limitations section of the orthopedic assessment.

CREATE TABLE assessment_functional_limitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    dressing_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dressing_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    washing_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (washing_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    eating_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (eating_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    work_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (work_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    household_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (household_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    lifting_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lifting_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    sleep_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    recreation_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (recreation_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    driving_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', 'not-applicable', '')),
    walking_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (walking_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    stair_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stair_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    aids_in_use TEXT NOT NULL DEFAULT '',
    functional_limitations_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_limitations_updated_at
    BEFORE UPDATE ON assessment_functional_limitations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_limitations IS
    'Functional limitations section: difficulty levels across daily activities, work, and recreation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_limitations.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_limitations.dressing_difficulty IS
    'Difficulty with dressing: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.washing_difficulty IS
    'Difficulty with washing and bathing: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.eating_difficulty IS
    'Difficulty with eating and food preparation: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.work_difficulty IS
    'Difficulty with work tasks: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.household_difficulty IS
    'Difficulty with household tasks: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.lifting_difficulty IS
    'Difficulty with lifting and carrying: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.sleep_difficulty IS
    'Difficulty with sleeping due to the condition: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.recreation_difficulty IS
    'Difficulty with recreational activities: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.driving_difficulty IS
    'Difficulty with driving: none, mild, moderate, severe, unable, not-applicable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.walking_difficulty IS
    'Difficulty with walking: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.stair_difficulty IS
    'Difficulty with stairs: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_limitations.aids_in_use IS
    'Assistive devices and aids currently in use (splint, brace, crutches, etc.).';
COMMENT ON COLUMN assessment_functional_limitations.functional_limitations_notes IS
    'Additional clinician notes on functional limitations.';

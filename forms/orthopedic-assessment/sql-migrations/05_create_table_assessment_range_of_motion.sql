CREATE TABLE assessment_range_of_motion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    joint_assessed VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (joint_assessed IN ('shoulder', 'elbow', 'wrist', 'hand', 'hip', 'knee', 'ankle', 'spine-cervical', 'spine-lumbar', 'other', '')),
    side_assessed VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (side_assessed IN ('left', 'right', 'bilateral', '')),
    overall_rom_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_rom_status IN ('full', 'mildly-restricted', 'moderately-restricted', 'severely-restricted', '')),
    range_of_motion_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_range_of_motion_updated_at
    BEFORE UPDATE ON assessment_range_of_motion
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_range_of_motion IS
    'Range of motion section header: joint, side, and overall status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_range_of_motion.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_range_of_motion.joint_assessed IS
    'Primary joint being assessed for range of motion.';
COMMENT ON COLUMN assessment_range_of_motion.side_assessed IS
    'Side assessed: left, right, bilateral, or empty.';
COMMENT ON COLUMN assessment_range_of_motion.overall_rom_status IS
    'Overall range of motion status: full, mildly-restricted, moderately-restricted, severely-restricted, or empty.';
COMMENT ON COLUMN assessment_range_of_motion.range_of_motion_notes IS
    'Additional notes on range of motion assessment.';

-- Individual ROM measurements (one-to-many child)

COMMENT ON COLUMN assessment_range_of_motion.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_range_of_motion.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_range_of_motion.updated_at IS
    'Timestamp when this row was last updated.';

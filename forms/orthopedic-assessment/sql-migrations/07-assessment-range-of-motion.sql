-- 07_assessment_range_of_motion.sql
-- Range of motion section of the orthopaedic assessment.

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

CREATE TRIGGER trg_assessment_range_of_motion_updated_at
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
CREATE TABLE assessment_rom_measurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    range_of_motion_id UUID NOT NULL
        REFERENCES assessment_range_of_motion(id) ON DELETE CASCADE,

    movement VARCHAR(50) NOT NULL DEFAULT '',
    active_degrees INTEGER
        CHECK (active_degrees IS NULL OR (active_degrees >= 0 AND active_degrees <= 360)),
    passive_degrees INTEGER
        CHECK (passive_degrees IS NULL OR (passive_degrees >= 0 AND passive_degrees <= 360)),
    normal_degrees INTEGER
        CHECK (normal_degrees IS NULL OR (normal_degrees >= 0 AND normal_degrees <= 360)),
    end_feel VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (end_feel IN ('firm', 'hard', 'soft', 'empty', 'springy', '')),
    pain_on_movement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_on_movement IN ('yes', 'no', '')),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_rom_measurement_updated_at
    BEFORE UPDATE ON assessment_rom_measurement
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_rom_measurement IS
    'Individual range of motion measurement for a specific movement (e.g. flexion, extension, abduction).';
COMMENT ON COLUMN assessment_rom_measurement.movement IS
    'Name of the movement being measured (e.g. flexion, extension, abduction, internal rotation).';
COMMENT ON COLUMN assessment_rom_measurement.active_degrees IS
    'Active range of motion in degrees.';
COMMENT ON COLUMN assessment_rom_measurement.passive_degrees IS
    'Passive range of motion in degrees.';
COMMENT ON COLUMN assessment_rom_measurement.normal_degrees IS
    'Expected normal range of motion in degrees for comparison.';
COMMENT ON COLUMN assessment_rom_measurement.end_feel IS
    'End feel on passive movement: firm, hard, soft, empty, springy, or empty string.';
COMMENT ON COLUMN assessment_rom_measurement.pain_on_movement IS
    'Whether pain is present during this movement: yes, no, or empty.';
COMMENT ON COLUMN assessment_rom_measurement.sort_order IS
    'Display order of the measurement within the list.';

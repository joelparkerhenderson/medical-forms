CREATE TABLE assessment_rom_measurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
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
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_rom_measurement_updated_at
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

COMMENT ON COLUMN assessment_range_of_motion.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_range_of_motion.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_range_of_motion.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_rom_measurement.range_of_motion_id IS
    'Foreign key to the assessment_range_of_motion table.';
COMMENT ON COLUMN assessment_rom_measurement.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_rom_measurement.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_rom_measurement.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_rom_measurement.deleted_at IS
    'Timestamp when this row was deleted.';

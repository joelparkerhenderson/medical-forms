-- 06_assessment_repetitive_tasks.sql
-- Step 4: Repetitive tasks section of the ergonomic assessment.

CREATE TABLE assessment_repetitive_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    keyboard_use_hours NUMERIC(3,1)
        CHECK (keyboard_use_hours IS NULL OR (keyboard_use_hours >= 0 AND keyboard_use_hours <= 24)),
    mouse_use_hours NUMERIC(3,1)
        CHECK (mouse_use_hours IS NULL OR (mouse_use_hours >= 0 AND mouse_use_hours <= 24)),
    repetitive_hand_movements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (repetitive_hand_movements IN ('yes', 'no', '')),
    hand_movement_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hand_movement_frequency IN ('low', 'moderate', 'high', 'very_high', '')),
    hand_movement_description TEXT NOT NULL DEFAULT '',
    repetitive_arm_movements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (repetitive_arm_movements IN ('yes', 'no', '')),
    arm_movement_description TEXT NOT NULL DEFAULT '',
    sustained_grip VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sustained_grip IN ('yes', 'no', '')),
    grip_duration_minutes INTEGER
        CHECK (grip_duration_minutes IS NULL OR grip_duration_minutes >= 0),
    pinch_grip_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pinch_grip_required IN ('yes', 'no', '')),
    vibrating_tools_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vibrating_tools_use IN ('yes', 'no', '')),
    vibrating_tools_details TEXT NOT NULL DEFAULT '',
    task_rotation_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (task_rotation_available IN ('yes', 'no', '')),
    cycle_time_seconds INTEGER
        CHECK (cycle_time_seconds IS NULL OR cycle_time_seconds >= 0),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_repetitive_tasks_updated_at
    BEFORE UPDATE ON assessment_repetitive_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_repetitive_tasks IS
    'Step 4 Repetitive Tasks: frequency and type of repetitive movements in the workplace. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_repetitive_tasks.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_repetitive_tasks.keyboard_use_hours IS
    'Average hours per day spent using a keyboard.';
COMMENT ON COLUMN assessment_repetitive_tasks.mouse_use_hours IS
    'Average hours per day spent using a mouse or pointing device.';
COMMENT ON COLUMN assessment_repetitive_tasks.repetitive_hand_movements IS
    'Whether the job involves repetitive hand movements.';
COMMENT ON COLUMN assessment_repetitive_tasks.hand_movement_frequency IS
    'Frequency of repetitive hand movements.';
COMMENT ON COLUMN assessment_repetitive_tasks.hand_movement_description IS
    'Description of repetitive hand movements.';
COMMENT ON COLUMN assessment_repetitive_tasks.repetitive_arm_movements IS
    'Whether the job involves repetitive arm movements.';
COMMENT ON COLUMN assessment_repetitive_tasks.arm_movement_description IS
    'Description of repetitive arm movements.';
COMMENT ON COLUMN assessment_repetitive_tasks.sustained_grip IS
    'Whether the job requires sustained gripping.';
COMMENT ON COLUMN assessment_repetitive_tasks.grip_duration_minutes IS
    'Duration of sustained grip in minutes.';
COMMENT ON COLUMN assessment_repetitive_tasks.pinch_grip_required IS
    'Whether the job requires frequent pinch gripping.';
COMMENT ON COLUMN assessment_repetitive_tasks.vibrating_tools_use IS
    'Whether vibrating tools or equipment are used (HAVS risk).';
COMMENT ON COLUMN assessment_repetitive_tasks.vibrating_tools_details IS
    'Details of vibrating tool usage.';
COMMENT ON COLUMN assessment_repetitive_tasks.task_rotation_available IS
    'Whether task rotation is available to reduce repetitive strain.';
COMMENT ON COLUMN assessment_repetitive_tasks.cycle_time_seconds IS
    'Average task cycle time in seconds for repetitive work.';
COMMENT ON COLUMN assessment_repetitive_tasks.additional_notes IS
    'Additional notes about repetitive tasks.';

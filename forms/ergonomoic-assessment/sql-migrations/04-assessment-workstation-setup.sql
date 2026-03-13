-- 04_assessment_workstation_setup.sql
-- Step 2: Workstation setup section of the ergonomic assessment.

CREATE TABLE assessment_workstation_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    workstation_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (workstation_type IN ('office_desk', 'standing_desk', 'sit_stand', 'industrial', 'vehicle', 'laboratory', 'other', '')),
    workstation_type_other TEXT NOT NULL DEFAULT '',
    chair_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (chair_type IN ('ergonomic', 'standard', 'stool', 'none', 'other', '')),
    chair_adjustable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chair_adjustable IN ('yes', 'no', '')),
    monitor_count INTEGER
        CHECK (monitor_count IS NULL OR (monitor_count >= 0 AND monitor_count <= 10)),
    monitor_position VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (monitor_position IN ('eye_level', 'above', 'below', 'to_side', '')),
    monitor_distance_cm NUMERIC(5,1)
        CHECK (monitor_distance_cm IS NULL OR monitor_distance_cm >= 0),
    keyboard_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (keyboard_type IN ('standard', 'ergonomic', 'split', 'laptop', '')),
    mouse_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mouse_type IN ('standard', 'ergonomic', 'trackpad', 'trackball', '')),
    desk_height_adjustable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (desk_height_adjustable IN ('yes', 'no', '')),
    footrest_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (footrest_available IN ('yes', 'no', '')),
    wrist_rest_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wrist_rest_available IN ('yes', 'no', '')),
    lighting_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lighting_adequate IN ('yes', 'no', '')),
    lighting_notes TEXT NOT NULL DEFAULT '',
    hours_at_workstation_per_day NUMERIC(3,1)
        CHECK (hours_at_workstation_per_day IS NULL OR (hours_at_workstation_per_day >= 0 AND hours_at_workstation_per_day <= 24)),
    break_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (break_frequency IN ('every_30_min', 'every_hour', 'every_2_hours', 'rarely', 'never', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_workstation_setup_updated_at
    BEFORE UPDATE ON assessment_workstation_setup
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_workstation_setup IS
    'Step 2 Workstation Setup: physical workspace configuration and equipment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_workstation_setup.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_workstation_setup.workstation_type IS
    'Type of workstation the patient primarily uses.';
COMMENT ON COLUMN assessment_workstation_setup.workstation_type_other IS
    'Description if workstation type is other.';
COMMENT ON COLUMN assessment_workstation_setup.chair_type IS
    'Type of chair used at the workstation.';
COMMENT ON COLUMN assessment_workstation_setup.chair_adjustable IS
    'Whether the chair is height and tilt adjustable.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_count IS
    'Number of monitors used.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_position IS
    'Position of monitor relative to eye level.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_distance_cm IS
    'Distance from eyes to monitor in centimetres.';
COMMENT ON COLUMN assessment_workstation_setup.keyboard_type IS
    'Type of keyboard used.';
COMMENT ON COLUMN assessment_workstation_setup.mouse_type IS
    'Type of pointing device used.';
COMMENT ON COLUMN assessment_workstation_setup.desk_height_adjustable IS
    'Whether the desk height is adjustable.';
COMMENT ON COLUMN assessment_workstation_setup.footrest_available IS
    'Whether a footrest is available and in use.';
COMMENT ON COLUMN assessment_workstation_setup.wrist_rest_available IS
    'Whether a wrist rest is available and in use.';
COMMENT ON COLUMN assessment_workstation_setup.lighting_adequate IS
    'Whether workplace lighting is adequate.';
COMMENT ON COLUMN assessment_workstation_setup.lighting_notes IS
    'Details about lighting issues (e.g. glare, insufficient light).';
COMMENT ON COLUMN assessment_workstation_setup.hours_at_workstation_per_day IS
    'Average hours spent at the workstation per day.';
COMMENT ON COLUMN assessment_workstation_setup.break_frequency IS
    'How often the patient takes breaks from the workstation.';
COMMENT ON COLUMN assessment_workstation_setup.additional_notes IS
    'Additional notes about workstation setup.';

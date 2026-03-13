-- ============================================================
-- 03_assessment_workstation_setup.sql
-- Workstation configuration details (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_workstation_setup (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    desk_height         TEXT NOT NULL DEFAULT ''
                        CHECK (desk_height IN ('too-low', 'correct', 'too-high', '')),
    chair_type          TEXT NOT NULL DEFAULT ''
                        CHECK (chair_type IN ('fixed', 'adjustable', 'standing-desk', 'other', '')),
    chair_adjustability TEXT NOT NULL DEFAULT ''
                        CHECK (chair_adjustability IN ('yes', 'no', '')),
    monitor_position    TEXT NOT NULL DEFAULT ''
                        CHECK (monitor_position IN ('too-close', 'correct', 'too-far', '')),
    monitor_distance    TEXT NOT NULL DEFAULT ''
                        CHECK (monitor_distance IN ('less-than-40cm', '40-70cm', 'more-than-70cm', '')),
    monitor_height      TEXT NOT NULL DEFAULT ''
                        CHECK (monitor_height IN ('below-eye-level', 'at-eye-level', 'above-eye-level', '')),
    keyboard_placement  TEXT NOT NULL DEFAULT ''
                        CHECK (keyboard_placement IN ('correct', 'too-high', 'too-far', 'angled-incorrectly', '')),
    mouse_placement     TEXT NOT NULL DEFAULT ''
                        CHECK (mouse_placement IN ('beside-keyboard', 'too-far', 'awkward-reach', '')),
    lighting            TEXT NOT NULL DEFAULT ''
                        CHECK (lighting IN ('adequate', 'too-bright', 'too-dim', 'glare-present', '')),
    temperature         TEXT NOT NULL DEFAULT ''
                        CHECK (temperature IN ('comfortable', 'too-hot', 'too-cold', '')),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_workstation_setup_updated_at
    BEFORE UPDATE ON assessment_workstation_setup
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_workstation_setup IS
    'Workstation configuration: desk, chair, monitor, keyboard, mouse, lighting, temperature.';
COMMENT ON COLUMN assessment_workstation_setup.desk_height IS
    'Desk height assessment: too-low, correct, too-high, or empty if unanswered.';
COMMENT ON COLUMN assessment_workstation_setup.chair_type IS
    'Type of chair: fixed, adjustable, standing-desk, other, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.chair_adjustability IS
    'Whether the chair is adjustable: yes, no, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_position IS
    'Monitor distance from user: too-close, correct, too-far, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_distance IS
    'Measured monitor distance range: less-than-40cm, 40-70cm, more-than-70cm, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.monitor_height IS
    'Monitor height relative to eye level: below-eye-level, at-eye-level, above-eye-level, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.keyboard_placement IS
    'Keyboard position: correct, too-high, too-far, angled-incorrectly, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.mouse_placement IS
    'Mouse position: beside-keyboard, too-far, awkward-reach, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.lighting IS
    'Lighting conditions: adequate, too-bright, too-dim, glare-present, or empty.';
COMMENT ON COLUMN assessment_workstation_setup.temperature IS
    'Thermal comfort: comfortable, too-hot, too-cold, or empty.';

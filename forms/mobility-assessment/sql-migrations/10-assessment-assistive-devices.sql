-- 10_assessment_assistive_devices.sql
-- Assistive devices section of the mobility assessment.

CREATE TABLE assessment_assistive_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    uses_assistive_device VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_assistive_device IN ('yes', 'no', '')),
    walking_stick VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (walking_stick IN ('yes', 'no', '')),
    walking_frame VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (walking_frame IN ('yes', 'no', '')),
    rollator VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rollator IN ('yes', 'no', '')),
    wheelchair VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wheelchair IN ('yes', 'no', '')),
    wheelchair_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wheelchair_type IN ('manual', 'powered', '')),
    orthotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orthotics IN ('yes', 'no', '')),
    orthotics_details TEXT NOT NULL DEFAULT '',
    other_device TEXT NOT NULL DEFAULT '',
    device_condition VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (device_condition IN ('good', 'fair', 'poor', 'needs-replacement', '')),
    device_appropriate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (device_appropriate IN ('yes', 'no', '')),
    device_used_correctly VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (device_used_correctly IN ('yes', 'no', '')),
    home_adaptations TEXT NOT NULL DEFAULT '',
    assistive_device_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_assistive_devices_updated_at
    BEFORE UPDATE ON assessment_assistive_devices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_assistive_devices IS
    'Assistive devices section: walking aids, wheelchair, orthotics, and home adaptations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_assistive_devices.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_assistive_devices.uses_assistive_device IS
    'Whether the patient uses any assistive device for mobility: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.walking_stick IS
    'Whether the patient uses a walking stick/cane: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.walking_frame IS
    'Whether the patient uses a walking frame (Zimmer frame): yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.rollator IS
    'Whether the patient uses a rollator (wheeled walker): yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.wheelchair IS
    'Whether the patient uses a wheelchair: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.wheelchair_type IS
    'Wheelchair type: manual, powered, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.orthotics IS
    'Whether the patient uses orthotics: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.orthotics_details IS
    'Free-text details of orthotic devices used.';
COMMENT ON COLUMN assessment_assistive_devices.other_device IS
    'Free-text description of any other assistive devices.';
COMMENT ON COLUMN assessment_assistive_devices.device_condition IS
    'Condition of the primary assistive device: good, fair, poor, needs-replacement, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.device_appropriate IS
    'Whether the current device is appropriate for the patient: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.device_used_correctly IS
    'Whether the patient uses the device correctly: yes, no, or empty string.';
COMMENT ON COLUMN assessment_assistive_devices.home_adaptations IS
    'Free-text description of home adaptations (grab rails, stairlift, etc.).';
COMMENT ON COLUMN assessment_assistive_devices.assistive_device_notes IS
    'Free-text clinician observations on assistive devices.';

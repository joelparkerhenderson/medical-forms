-- 07_assessment_contributing_factors.sql
-- Contributing factors section of the medical error report.

CREATE TABLE assessment_contributing_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    staff_fatigue VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (staff_fatigue IN ('yes', 'no', '')),
    inadequate_training VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inadequate_training IN ('yes', 'no', '')),
    communication_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (communication_failure IN ('yes', 'no', '')),
    communication_failure_details TEXT NOT NULL DEFAULT '',
    handover_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (handover_failure IN ('yes', 'no', '')),
    equipment_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (equipment_failure IN ('yes', 'no', '')),
    equipment_failure_details TEXT NOT NULL DEFAULT '',
    environmental_factors VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (environmental_factors IN ('yes', 'no', '')),
    environmental_details TEXT NOT NULL DEFAULT '',
    policy_not_followed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (policy_not_followed IN ('yes', 'no', '')),
    policy_details TEXT NOT NULL DEFAULT '',
    workload_pressure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (workload_pressure IN ('yes', 'no', '')),
    patient_factors VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_factors IN ('yes', 'no', '')),
    patient_factors_details TEXT NOT NULL DEFAULT '',
    other_factors TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contributing_factors_updated_at
    BEFORE UPDATE ON assessment_contributing_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contributing_factors IS
    'Contributing factors section: human, system, and environmental factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contributing_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contributing_factors.staff_fatigue IS
    'Whether staff fatigue contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.inadequate_training IS
    'Whether inadequate training contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.communication_failure IS
    'Whether communication failure contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.communication_failure_details IS
    'Details of the communication failure.';
COMMENT ON COLUMN assessment_contributing_factors.handover_failure IS
    'Whether a handover failure contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.equipment_failure IS
    'Whether equipment failure contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.equipment_failure_details IS
    'Details of the equipment failure.';
COMMENT ON COLUMN assessment_contributing_factors.environmental_factors IS
    'Whether environmental factors contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.environmental_details IS
    'Details of environmental factors (noise, lighting, interruptions, etc.).';
COMMENT ON COLUMN assessment_contributing_factors.policy_not_followed IS
    'Whether a policy or protocol was not followed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.policy_details IS
    'Which policy or protocol was not followed.';
COMMENT ON COLUMN assessment_contributing_factors.workload_pressure IS
    'Whether excessive workload contributed: yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.patient_factors IS
    'Whether patient factors contributed (e.g. non-compliance, language barrier): yes, no, or empty.';
COMMENT ON COLUMN assessment_contributing_factors.patient_factors_details IS
    'Details of patient factors.';
COMMENT ON COLUMN assessment_contributing_factors.other_factors IS
    'Any other contributing factors not listed above.';

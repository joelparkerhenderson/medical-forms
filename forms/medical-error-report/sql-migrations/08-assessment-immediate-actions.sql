-- 08_assessment_immediate_actions.sql
-- Immediate actions taken section of the medical error report.

CREATE TABLE assessment_immediate_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_assessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_assessed IN ('yes', 'no', 'not-applicable', '')),
    treatment_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (treatment_provided IN ('yes', 'no', 'not-applicable', '')),
    treatment_details TEXT NOT NULL DEFAULT '',
    error_contained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (error_contained IN ('yes', 'no', '')),
    containment_details TEXT NOT NULL DEFAULT '',
    senior_staff_notified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (senior_staff_notified IN ('yes', 'no', '')),
    senior_staff_name VARCHAR(255) NOT NULL DEFAULT '',
    senior_staff_role VARCHAR(255) NOT NULL DEFAULT '',
    risk_team_notified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (risk_team_notified IN ('yes', 'no', '')),
    additional_monitoring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (additional_monitoring IN ('yes', 'no', '')),
    monitoring_details TEXT NOT NULL DEFAULT '',
    immediate_actions_summary TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_immediate_actions_updated_at
    BEFORE UPDATE ON assessment_immediate_actions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_immediate_actions IS
    'Immediate actions taken section: patient assessment, containment, notification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_immediate_actions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_immediate_actions.patient_assessed IS
    'Whether the patient was assessed after the error: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.treatment_provided IS
    'Whether immediate treatment was provided: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.treatment_details IS
    'Details of immediate treatment provided.';
COMMENT ON COLUMN assessment_immediate_actions.error_contained IS
    'Whether the error was contained: yes, no, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.containment_details IS
    'How the error was contained.';
COMMENT ON COLUMN assessment_immediate_actions.senior_staff_notified IS
    'Whether senior staff were notified: yes, no, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.senior_staff_name IS
    'Name of the senior staff member notified.';
COMMENT ON COLUMN assessment_immediate_actions.senior_staff_role IS
    'Role of the senior staff member notified.';
COMMENT ON COLUMN assessment_immediate_actions.risk_team_notified IS
    'Whether the risk management team was notified: yes, no, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.additional_monitoring IS
    'Whether additional monitoring was initiated: yes, no, or empty.';
COMMENT ON COLUMN assessment_immediate_actions.monitoring_details IS
    'Details of additional monitoring.';
COMMENT ON COLUMN assessment_immediate_actions.immediate_actions_summary IS
    'Summary of all immediate actions taken.';

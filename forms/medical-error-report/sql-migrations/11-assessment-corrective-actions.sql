-- 11_assessment_corrective_actions.sql
-- Corrective actions section of the medical error report.

CREATE TABLE assessment_corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    immediate_corrective_actions TEXT NOT NULL DEFAULT '',
    long_term_corrective_actions TEXT NOT NULL DEFAULT '',
    policy_change_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (policy_change_required IN ('yes', 'no', '')),
    policy_change_details TEXT NOT NULL DEFAULT '',
    training_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (training_required IN ('yes', 'no', '')),
    training_details TEXT NOT NULL DEFAULT '',
    equipment_change_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (equipment_change_required IN ('yes', 'no', '')),
    equipment_change_details TEXT NOT NULL DEFAULT '',
    process_redesign_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (process_redesign_required IN ('yes', 'no', '')),
    process_redesign_details TEXT NOT NULL DEFAULT '',
    responsible_person VARCHAR(255) NOT NULL DEFAULT '',
    target_completion_date DATE,
    actions_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (actions_status IN ('planned', 'in-progress', 'completed', 'overdue', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_corrective_actions_updated_at
    BEFORE UPDATE ON assessment_corrective_actions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_corrective_actions IS
    'Corrective actions section: immediate and long-term remediation plans. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_corrective_actions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_corrective_actions.immediate_corrective_actions IS
    'Description of immediate corrective actions taken.';
COMMENT ON COLUMN assessment_corrective_actions.long_term_corrective_actions IS
    'Description of long-term corrective actions planned.';
COMMENT ON COLUMN assessment_corrective_actions.policy_change_required IS
    'Whether a policy change is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_corrective_actions.policy_change_details IS
    'Details of required policy changes.';
COMMENT ON COLUMN assessment_corrective_actions.training_required IS
    'Whether additional training is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_corrective_actions.training_details IS
    'Details of required training.';
COMMENT ON COLUMN assessment_corrective_actions.equipment_change_required IS
    'Whether equipment changes are required: yes, no, or empty.';
COMMENT ON COLUMN assessment_corrective_actions.equipment_change_details IS
    'Details of required equipment changes.';
COMMENT ON COLUMN assessment_corrective_actions.process_redesign_required IS
    'Whether process redesign is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_corrective_actions.process_redesign_details IS
    'Details of required process redesign.';
COMMENT ON COLUMN assessment_corrective_actions.responsible_person IS
    'Person responsible for implementing corrective actions.';
COMMENT ON COLUMN assessment_corrective_actions.target_completion_date IS
    'Target date for completing all corrective actions.';
COMMENT ON COLUMN assessment_corrective_actions.actions_status IS
    'Status of corrective actions: planned, in-progress, completed, overdue, or empty.';

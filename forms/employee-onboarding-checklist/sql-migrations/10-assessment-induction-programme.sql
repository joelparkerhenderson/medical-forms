-- 10_assessment_induction_programme.sql
-- Induction programme section of the onboarding assessment.

CREATE TABLE assessment_induction_programme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    corporate_induction_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (corporate_induction_completed IN ('yes', 'no', '')),
    corporate_induction_date DATE,
    local_induction_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (local_induction_completed IN ('yes', 'no', '')),
    local_induction_date DATE,
    department_tour_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (department_tour_completed IN ('yes', 'no', '')),
    introduced_to_team VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (introduced_to_team IN ('yes', 'no', '')),
    emergency_procedures_briefed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (emergency_procedures_briefed IN ('yes', 'no', '')),
    policies_handbook_received VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (policies_handbook_received IN ('yes', 'no', '')),
    buddy_assigned VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (buddy_assigned IN ('yes', 'no', '')),
    buddy_name VARCHAR(255) NOT NULL DEFAULT '',
    induction_programme_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_induction_programme_updated_at
    BEFORE UPDATE ON assessment_induction_programme
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_induction_programme IS
    'Induction programme section: corporate and local induction, department orientation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_induction_programme.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_induction_programme.corporate_induction_completed IS
    'Whether corporate (Trust-wide) induction has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.corporate_induction_date IS
    'Date corporate induction was completed.';
COMMENT ON COLUMN assessment_induction_programme.local_induction_completed IS
    'Whether local department induction has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.local_induction_date IS
    'Date local induction was completed.';
COMMENT ON COLUMN assessment_induction_programme.department_tour_completed IS
    'Whether a department tour has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.introduced_to_team IS
    'Whether the employee has been introduced to team members: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.emergency_procedures_briefed IS
    'Whether the employee has been briefed on emergency procedures: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.policies_handbook_received IS
    'Whether the employee has received the policies handbook: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.buddy_assigned IS
    'Whether a buddy or mentor has been assigned: yes, no, or empty.';
COMMENT ON COLUMN assessment_induction_programme.buddy_name IS
    'Name of the assigned buddy or mentor.';
COMMENT ON COLUMN assessment_induction_programme.induction_programme_notes IS
    'Additional notes on the induction programme.';

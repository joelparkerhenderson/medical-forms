-- 11_assessment_probation_supervision.sql
-- Probation and supervision section of the onboarding assessment.

CREATE TABLE assessment_probation_supervision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    probation_period_months INTEGER
        CHECK (probation_period_months IS NULL OR (probation_period_months >= 0 AND probation_period_months <= 24)),
    probation_start_date DATE,
    probation_end_date DATE,
    line_manager_name VARCHAR(255) NOT NULL DEFAULT '',
    line_manager_email VARCHAR(255) NOT NULL DEFAULT '',
    supervisor_name VARCHAR(255) NOT NULL DEFAULT '',
    supervision_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (supervision_frequency IN ('weekly', 'fortnightly', 'monthly', 'quarterly', '')),
    first_supervision_date DATE,
    objectives_set VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (objectives_set IN ('yes', 'no', '')),
    appraisal_date_agreed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (appraisal_date_agreed IN ('yes', 'no', '')),
    appraisal_date DATE,
    probation_supervision_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_probation_supervision_updated_at
    BEFORE UPDATE ON assessment_probation_supervision
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_probation_supervision IS
    'Probation and supervision section: probation period, line management, supervision schedule. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_probation_supervision.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_probation_supervision.probation_period_months IS
    'Length of probation period in months.';
COMMENT ON COLUMN assessment_probation_supervision.probation_start_date IS
    'Start date of the probation period.';
COMMENT ON COLUMN assessment_probation_supervision.probation_end_date IS
    'End date of the probation period.';
COMMENT ON COLUMN assessment_probation_supervision.line_manager_name IS
    'Name of the line manager.';
COMMENT ON COLUMN assessment_probation_supervision.line_manager_email IS
    'Email address of the line manager.';
COMMENT ON COLUMN assessment_probation_supervision.supervisor_name IS
    'Name of the clinical or professional supervisor.';
COMMENT ON COLUMN assessment_probation_supervision.supervision_frequency IS
    'Frequency of supervision meetings: weekly, fortnightly, monthly, quarterly, or empty.';
COMMENT ON COLUMN assessment_probation_supervision.first_supervision_date IS
    'Date of the first supervision meeting.';
COMMENT ON COLUMN assessment_probation_supervision.objectives_set IS
    'Whether initial objectives have been set: yes, no, or empty.';
COMMENT ON COLUMN assessment_probation_supervision.appraisal_date_agreed IS
    'Whether the first appraisal date has been agreed: yes, no, or empty.';
COMMENT ON COLUMN assessment_probation_supervision.appraisal_date IS
    'Agreed date for the first appraisal.';
COMMENT ON COLUMN assessment_probation_supervision.probation_supervision_notes IS
    'Additional notes on probation and supervision.';

-- 11_assessment_psychosocial_factors.sql
-- Step 9: Psychosocial factors section of the ergonomic assessment.

CREATE TABLE assessment_psychosocial_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    job_satisfaction VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (job_satisfaction IN ('very_high', 'high', 'moderate', 'low', 'very_low', '')),
    work_pace VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (work_pace IN ('relaxed', 'moderate', 'demanding', 'very_demanding', '')),
    job_control VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (job_control IN ('high', 'moderate', 'low', '')),
    work_related_stress VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (work_related_stress IN ('low', 'moderate', 'high', 'very_high', '')),
    support_from_colleagues VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (support_from_colleagues IN ('good', 'adequate', 'poor', '')),
    support_from_management VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (support_from_management IN ('good', 'adequate', 'poor', '')),
    overtime_hours_per_week NUMERIC(4,1)
        CHECK (overtime_hours_per_week IS NULL OR overtime_hours_per_week >= 0),
    deadline_pressure VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (deadline_pressure IN ('low', 'moderate', 'high', '')),
    work_life_balance VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (work_life_balance IN ('good', 'adequate', 'poor', '')),
    fear_of_job_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fear_of_job_loss IN ('yes', 'no', '')),
    monotonous_work VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (monotonous_work IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychosocial_factors_updated_at
    BEFORE UPDATE ON assessment_psychosocial_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychosocial_factors IS
    'Step 9 Psychosocial Factors: workplace psychosocial risk factors for musculoskeletal disorders. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychosocial_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychosocial_factors.job_satisfaction IS
    'Overall job satisfaction level.';
COMMENT ON COLUMN assessment_psychosocial_factors.work_pace IS
    'Perceived work pace.';
COMMENT ON COLUMN assessment_psychosocial_factors.job_control IS
    'Level of control the worker has over their tasks and schedule.';
COMMENT ON COLUMN assessment_psychosocial_factors.work_related_stress IS
    'Level of work-related stress.';
COMMENT ON COLUMN assessment_psychosocial_factors.support_from_colleagues IS
    'Quality of peer support in the workplace.';
COMMENT ON COLUMN assessment_psychosocial_factors.support_from_management IS
    'Quality of management support.';
COMMENT ON COLUMN assessment_psychosocial_factors.overtime_hours_per_week IS
    'Average weekly overtime hours.';
COMMENT ON COLUMN assessment_psychosocial_factors.deadline_pressure IS
    'Level of deadline pressure.';
COMMENT ON COLUMN assessment_psychosocial_factors.work_life_balance IS
    'Perceived work-life balance.';
COMMENT ON COLUMN assessment_psychosocial_factors.fear_of_job_loss IS
    'Whether the worker fears job loss (psychosocial risk factor).';
COMMENT ON COLUMN assessment_psychosocial_factors.monotonous_work IS
    'Whether the work is perceived as monotonous.';
COMMENT ON COLUMN assessment_psychosocial_factors.additional_notes IS
    'Additional notes about psychosocial factors.';

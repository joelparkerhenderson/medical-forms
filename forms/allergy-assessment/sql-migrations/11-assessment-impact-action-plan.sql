-- 11_assessment_impact_action_plan.sql
-- Impact and action plan section of the assessment.

CREATE TABLE assessment_impact_action_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    quality_of_life_score INTEGER
        CHECK (quality_of_life_score IS NULL OR (quality_of_life_score >= 1 AND quality_of_life_score <= 10)),
    school_work_impact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (school_work_impact IN ('yes', 'no', '')),
    school_work_impact_details TEXT NOT NULL DEFAULT '',
    emergency_action_plan_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (emergency_action_plan_status IN ('in-place', 'not-in-place', 'needs-update', '')),
    training_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (training_provided IN ('yes', 'no', '')),
    training_details TEXT NOT NULL DEFAULT '',
    follow_up_schedule TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_impact_action_plan_updated_at
    BEFORE UPDATE ON assessment_impact_action_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_impact_action_plan IS
    'Impact and action plan section: quality of life, school/work impact, emergency action plan, and follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_impact_action_plan.quality_of_life_score IS
    'Quality of life score from 1 (very poor) to 10 (excellent).';
COMMENT ON COLUMN assessment_impact_action_plan.emergency_action_plan_status IS
    'Status of emergency action plan: in-place, not-in-place, needs-update, or empty.';

-- 12_assessment_recommendations_action_plan.sql
-- Step 10: Recommendations and action plan section of the ergonomic assessment.

CREATE TABLE assessment_recommendations_action_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    workstation_modifications TEXT NOT NULL DEFAULT '',
    equipment_recommendations TEXT NOT NULL DEFAULT '',
    posture_advice TEXT NOT NULL DEFAULT '',
    exercise_programme TEXT NOT NULL DEFAULT '',
    break_schedule_advice TEXT NOT NULL DEFAULT '',
    referral_to_physiotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_to_physiotherapy IN ('yes', 'no', '')),
    referral_to_occupational_health VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_to_occupational_health IN ('yes', 'no', '')),
    referral_to_specialist VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_to_specialist IN ('yes', 'no', '')),
    specialist_type VARCHAR(255) NOT NULL DEFAULT '',
    follow_up_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (follow_up_required IN ('yes', 'no', '')),
    follow_up_date DATE,
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('2_weeks', '1_month', '3_months', '6_months', '')),
    priority_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (priority_level IN ('urgent', 'high', 'medium', 'low', '')),
    assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    assessment_date DATE,
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_recommendations_action_plan_updated_at
    BEFORE UPDATE ON assessment_recommendations_action_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_recommendations_action_plan IS
    'Step 10 Recommendations & Action Plan: ergonomic recommendations, referrals, and follow-up plan. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_recommendations_action_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_recommendations_action_plan.workstation_modifications IS
    'Recommended workstation modifications.';
COMMENT ON COLUMN assessment_recommendations_action_plan.equipment_recommendations IS
    'Recommended ergonomic equipment.';
COMMENT ON COLUMN assessment_recommendations_action_plan.posture_advice IS
    'Posture correction advice.';
COMMENT ON COLUMN assessment_recommendations_action_plan.exercise_programme IS
    'Recommended stretching or strengthening exercises.';
COMMENT ON COLUMN assessment_recommendations_action_plan.break_schedule_advice IS
    'Recommended break schedule and micro-break activities.';
COMMENT ON COLUMN assessment_recommendations_action_plan.referral_to_physiotherapy IS
    'Whether a physiotherapy referral is recommended.';
COMMENT ON COLUMN assessment_recommendations_action_plan.referral_to_occupational_health IS
    'Whether an occupational health referral is recommended.';
COMMENT ON COLUMN assessment_recommendations_action_plan.referral_to_specialist IS
    'Whether a specialist referral is recommended.';
COMMENT ON COLUMN assessment_recommendations_action_plan.specialist_type IS
    'Type of specialist referred to.';
COMMENT ON COLUMN assessment_recommendations_action_plan.follow_up_required IS
    'Whether follow-up is required.';
COMMENT ON COLUMN assessment_recommendations_action_plan.follow_up_date IS
    'Scheduled follow-up date, NULL if unanswered.';
COMMENT ON COLUMN assessment_recommendations_action_plan.follow_up_interval IS
    'Recommended follow-up interval.';
COMMENT ON COLUMN assessment_recommendations_action_plan.priority_level IS
    'Priority level for implementing recommendations.';
COMMENT ON COLUMN assessment_recommendations_action_plan.assessor_name IS
    'Name of the assessor or clinician.';
COMMENT ON COLUMN assessment_recommendations_action_plan.assessment_date IS
    'Date of the assessment, NULL if unanswered.';
COMMENT ON COLUMN assessment_recommendations_action_plan.clinician_notes IS
    'Additional clinician notes.';

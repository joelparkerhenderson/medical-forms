-- 12_assessment_management_plan.sql
-- Management plan section of the sundowner syndrome assessment.

CREATE TABLE assessment_management_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    non_pharmacological_interventions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (non_pharmacological_interventions IN ('yes', 'no', '')),
    light_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (light_therapy IN ('yes', 'no', '')),
    music_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (music_therapy IN ('yes', 'no', '')),
    aromatherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (aromatherapy IN ('yes', 'no', '')),
    structured_activities VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (structured_activities IN ('yes', 'no', '')),
    exercise_programme VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_programme IN ('yes', 'no', '')),
    sleep_hygiene_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_hygiene_plan IN ('yes', 'no', '')),
    environmental_modifications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (environmental_modifications IN ('yes', 'no', '')),
    environmental_modifications_details TEXT NOT NULL DEFAULT '',
    pharmacological_review VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pharmacological_review IN ('yes', 'no', '')),
    pharmacological_review_details TEXT NOT NULL DEFAULT '',
    referral_to_specialist VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_to_specialist IN ('yes', 'no', '')),
    specialist_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (specialist_type IN ('psychiatrist', 'geriatrician', 'neurologist', 'sleep-specialist', 'occupational-therapist', 'other', '')),
    carer_support_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support_plan IN ('yes', 'no', '')),
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('1-week', '2-weeks', '1-month', '3-months', '6-months', '')),
    safety_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safety_plan IN ('yes', 'no', '')),
    safety_plan_details TEXT NOT NULL DEFAULT '',
    management_plan_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_management_plan_updated_at
    BEFORE UPDATE ON assessment_management_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_management_plan IS
    'Management plan section: non-pharmacological and pharmacological interventions, referrals, and follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_management_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_management_plan.non_pharmacological_interventions IS
    'Whether non-pharmacological interventions are planned: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.light_therapy IS
    'Whether light therapy is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.music_therapy IS
    'Whether music therapy is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.aromatherapy IS
    'Whether aromatherapy is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.structured_activities IS
    'Whether structured afternoon activities are recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.exercise_programme IS
    'Whether an exercise programme is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.sleep_hygiene_plan IS
    'Whether a sleep hygiene plan is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.environmental_modifications IS
    'Whether environmental modifications are recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.environmental_modifications_details IS
    'Details of recommended environmental modifications.';
COMMENT ON COLUMN assessment_management_plan.pharmacological_review IS
    'Whether a pharmacological review is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.pharmacological_review_details IS
    'Details of recommended medication changes.';
COMMENT ON COLUMN assessment_management_plan.referral_to_specialist IS
    'Whether referral to a specialist is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.specialist_type IS
    'Type of specialist for referral: psychiatrist, geriatrician, neurologist, sleep-specialist, occupational-therapist, other, or empty.';
COMMENT ON COLUMN assessment_management_plan.carer_support_plan IS
    'Whether a carer support plan is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.follow_up_interval IS
    'Recommended follow-up interval: 1-week, 2-weeks, 1-month, 3-months, 6-months, or empty.';
COMMENT ON COLUMN assessment_management_plan.safety_plan IS
    'Whether a safety plan is in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_management_plan.safety_plan_details IS
    'Details of the safety plan.';
COMMENT ON COLUMN assessment_management_plan.management_plan_notes IS
    'Additional clinician notes on the management plan.';

-- 12_assessment_treatment_plan.sql
-- Treatment plan and monitoring section of the seasonal affective disorder assessment.

CREATE TABLE assessment_treatment_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    light_therapy_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (light_therapy_recommended IN ('yes', 'no', '')),
    light_therapy_prescription TEXT NOT NULL DEFAULT '',
    antidepressant_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antidepressant_recommended IN ('yes', 'no', '')),
    antidepressant_prescription TEXT NOT NULL DEFAULT '',
    cbt_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cbt_recommended IN ('yes', 'no', '')),
    exercise_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_recommended IN ('yes', 'no', '')),
    exercise_details TEXT NOT NULL DEFAULT '',
    lifestyle_advice TEXT NOT NULL DEFAULT '',
    vitamin_d_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vitamin_d_recommended IN ('yes', 'no', '')),
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('1-week', '2-weeks', '4-weeks', '6-weeks', '8-weeks', '12-weeks', '')),
    follow_up_date DATE,
    referral_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_required IN ('yes', 'no', '')),
    referral_to VARCHAR(100) NOT NULL DEFAULT '',
    crisis_plan TEXT NOT NULL DEFAULT '',
    treatment_plan_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_plan_updated_at
    BEFORE UPDATE ON assessment_treatment_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_plan IS
    'Treatment plan and monitoring section: recommended treatments, follow-up, referrals, and crisis planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_plan.light_therapy_recommended IS
    'Whether light therapy is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.light_therapy_prescription IS
    'Details of light therapy prescription (intensity, duration, timing).';
COMMENT ON COLUMN assessment_treatment_plan.antidepressant_recommended IS
    'Whether antidepressant medication is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.antidepressant_prescription IS
    'Details of antidepressant prescription.';
COMMENT ON COLUMN assessment_treatment_plan.cbt_recommended IS
    'Whether cognitive behavioural therapy is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.exercise_recommended IS
    'Whether exercise is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.exercise_details IS
    'Details of recommended exercise programme.';
COMMENT ON COLUMN assessment_treatment_plan.lifestyle_advice IS
    'Lifestyle advice given to the patient.';
COMMENT ON COLUMN assessment_treatment_plan.vitamin_d_recommended IS
    'Whether vitamin D supplementation is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.follow_up_interval IS
    'Recommended follow-up interval: 1-week, 2-weeks, 4-weeks, 6-weeks, 8-weeks, 12-weeks, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.follow_up_date IS
    'Specific follow-up appointment date.';
COMMENT ON COLUMN assessment_treatment_plan.referral_required IS
    'Whether referral to another service is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_plan.referral_to IS
    'Service or specialist to refer to.';
COMMENT ON COLUMN assessment_treatment_plan.crisis_plan IS
    'Crisis plan details including emergency contacts and escalation procedures.';
COMMENT ON COLUMN assessment_treatment_plan.treatment_plan_notes IS
    'Additional clinician notes on treatment plan.';

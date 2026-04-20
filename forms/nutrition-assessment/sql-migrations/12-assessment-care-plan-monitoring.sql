-- 12_assessment_care_plan_monitoring.sql
-- Care plan and monitoring section of the nutrition assessment.

CREATE TABLE assessment_care_plan_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nutritional_goals TEXT NOT NULL DEFAULT '',
    weight_monitoring_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_monitoring_frequency IN ('daily', 'weekly', 'fortnightly', 'monthly', 'not-required', '')),
    food_chart_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (food_chart_required IN ('yes', 'no', '')),
    fluid_balance_chart_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fluid_balance_chart_required IN ('yes', 'no', '')),
    dietitian_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dietitian_referral IN ('yes', 'no', '')),
    salt_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (salt_referral IN ('yes', 'no', '')),
    reassessment_date DATE,
    reassessment_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reassessment_frequency IN ('weekly', 'fortnightly', 'monthly', 'three-monthly', '')),
    escalation_plan TEXT NOT NULL DEFAULT '',
    discharge_nutrition_plan TEXT NOT NULL DEFAULT '',
    patient_education_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_education_provided IN ('yes', 'no', '')),
    patient_education_details TEXT NOT NULL DEFAULT '',
    care_plan_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_care_plan_monitoring_updated_at
    BEFORE UPDATE ON assessment_care_plan_monitoring
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_care_plan_monitoring IS
    'Care plan and monitoring section: goals, monitoring frequency, referrals, reassessment, and discharge planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_care_plan_monitoring.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_care_plan_monitoring.nutritional_goals IS
    'Agreed nutritional goals for the patient.';
COMMENT ON COLUMN assessment_care_plan_monitoring.weight_monitoring_frequency IS
    'Frequency of weight monitoring: daily, weekly, fortnightly, monthly, not-required, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.food_chart_required IS
    'Whether a food chart is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.fluid_balance_chart_required IS
    'Whether a fluid balance chart is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.dietitian_referral IS
    'Whether a dietitian referral is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.salt_referral IS
    'Whether a SALT (Speech and Language Therapy) referral is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.reassessment_date IS
    'Date for planned reassessment.';
COMMENT ON COLUMN assessment_care_plan_monitoring.reassessment_frequency IS
    'Frequency of reassessment: weekly, fortnightly, monthly, three-monthly, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.escalation_plan IS
    'Escalation plan if nutritional status deteriorates.';
COMMENT ON COLUMN assessment_care_plan_monitoring.discharge_nutrition_plan IS
    'Nutrition plan for discharge or ongoing care.';
COMMENT ON COLUMN assessment_care_plan_monitoring.patient_education_provided IS
    'Whether patient or carer education was provided: yes, no, or empty.';
COMMENT ON COLUMN assessment_care_plan_monitoring.patient_education_details IS
    'Details of nutritional education provided.';
COMMENT ON COLUMN assessment_care_plan_monitoring.care_plan_notes IS
    'Additional clinician notes on the care plan and monitoring.';

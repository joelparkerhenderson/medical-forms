-- 12_assessment_treatment_plan.sql
-- Treatment plan section of the semaglutide assessment.

CREATE TABLE assessment_treatment_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    semaglutide_formulation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (semaglutide_formulation IN ('subcutaneous', 'oral', '')),
    brand_name VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (brand_name IN ('ozempic', 'wegovy', 'rybelsus', '')),
    starting_dose TEXT NOT NULL DEFAULT '',
    dose_escalation_plan TEXT NOT NULL DEFAULT '',
    injection_site_education VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (injection_site_education IN ('yes', 'no', '')),
    dietary_counselling_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dietary_counselling_provided IN ('yes', 'no', '')),
    exercise_plan_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_plan_discussed IN ('yes', 'no', '')),
    behavioural_support_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (behavioural_support_referral IN ('yes', 'no', '')),
    monitoring_plan TEXT NOT NULL DEFAULT '',
    follow_up_interval_weeks INTEGER
        CHECK (follow_up_interval_weeks IS NULL OR follow_up_interval_weeks > 0),
    insulin_dose_adjustment_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insulin_dose_adjustment_needed IN ('yes', 'no', '')),
    sulfonylurea_dose_adjustment_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sulfonylurea_dose_adjustment_needed IN ('yes', 'no', '')),
    informed_consent_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (informed_consent_obtained IN ('yes', 'no', '')),
    side_effects_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (side_effects_discussed IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_plan_updated_at
    BEFORE UPDATE ON assessment_treatment_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_plan IS
    'Treatment plan section: semaglutide formulation, dosing, lifestyle, and monitoring plan. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_plan.semaglutide_formulation IS
    'Route of administration: subcutaneous or oral.';
COMMENT ON COLUMN assessment_treatment_plan.brand_name IS
    'Brand name: ozempic (T2DM SC), wegovy (weight SC), rybelsus (T2DM oral), or empty string.';
COMMENT ON COLUMN assessment_treatment_plan.starting_dose IS
    'Starting dose description (e.g. 0.25 mg SC weekly).';
COMMENT ON COLUMN assessment_treatment_plan.dose_escalation_plan IS
    'Planned dose escalation schedule.';
COMMENT ON COLUMN assessment_treatment_plan.injection_site_education IS
    'Whether injection site rotation education has been provided.';
COMMENT ON COLUMN assessment_treatment_plan.dietary_counselling_provided IS
    'Whether dietary counselling has been provided.';
COMMENT ON COLUMN assessment_treatment_plan.exercise_plan_discussed IS
    'Whether an exercise plan has been discussed.';
COMMENT ON COLUMN assessment_treatment_plan.behavioural_support_referral IS
    'Whether a behavioural support referral has been made.';
COMMENT ON COLUMN assessment_treatment_plan.monitoring_plan IS
    'Description of ongoing monitoring plan (weight, HbA1c, renal, liver).';
COMMENT ON COLUMN assessment_treatment_plan.follow_up_interval_weeks IS
    'Planned follow-up interval in weeks.';
COMMENT ON COLUMN assessment_treatment_plan.insulin_dose_adjustment_needed IS
    'Whether insulin dose adjustment is needed to prevent hypoglycaemia.';
COMMENT ON COLUMN assessment_treatment_plan.sulfonylurea_dose_adjustment_needed IS
    'Whether sulfonylurea dose adjustment is needed to prevent hypoglycaemia.';
COMMENT ON COLUMN assessment_treatment_plan.informed_consent_obtained IS
    'Whether informed consent has been obtained from the patient.';
COMMENT ON COLUMN assessment_treatment_plan.side_effects_discussed IS
    'Whether common side effects (nausea, vomiting, diarrhoea) have been discussed.';
COMMENT ON COLUMN assessment_treatment_plan.clinician_notes IS
    'Free-text clinician notes on the treatment plan.';

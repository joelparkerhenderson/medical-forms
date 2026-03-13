-- 04_assessment_indication_goals.sql
-- Indication and goals section of the semaglutide assessment.

CREATE TABLE assessment_indication_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_indication VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (primary_indication IN ('weight_management', 'type2_diabetes', 'cardiovascular_risk', 'other', '')),
    indication_other TEXT NOT NULL DEFAULT '',
    weight_loss_goal_kg NUMERIC(5,1)
        CHECK (weight_loss_goal_kg IS NULL OR weight_loss_goal_kg >= 0),
    target_hba1c_percent NUMERIC(4,1)
        CHECK (target_hba1c_percent IS NULL OR (target_hba1c_percent >= 0 AND target_hba1c_percent <= 20)),
    previous_weight_loss_attempts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_weight_loss_attempts IN ('yes', 'no', '')),
    previous_attempts_details TEXT NOT NULL DEFAULT '',
    previous_glp1_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_glp1_use IN ('yes', 'no', '')),
    previous_glp1_details TEXT NOT NULL DEFAULT '',
    patient_motivation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (patient_motivation IN ('high', 'moderate', 'low', '')),
    realistic_expectations_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (realistic_expectations_discussed IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_indication_goals_updated_at
    BEFORE UPDATE ON assessment_indication_goals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_indication_goals IS
    'Indication and goals section: treatment indication, weight/glycaemic targets, and prior attempts. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_indication_goals.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_indication_goals.primary_indication IS
    'Primary indication for semaglutide: weight_management, type2_diabetes, cardiovascular_risk, other, or empty string.';
COMMENT ON COLUMN assessment_indication_goals.indication_other IS
    'Free-text indication if "other" is selected.';
COMMENT ON COLUMN assessment_indication_goals.weight_loss_goal_kg IS
    'Target weight loss in kilograms.';
COMMENT ON COLUMN assessment_indication_goals.target_hba1c_percent IS
    'Target HbA1c percentage for diabetic patients.';
COMMENT ON COLUMN assessment_indication_goals.previous_weight_loss_attempts IS
    'Whether patient has tried previous weight loss interventions.';
COMMENT ON COLUMN assessment_indication_goals.previous_attempts_details IS
    'Details of previous weight loss attempts (diet, exercise, medications, surgery).';
COMMENT ON COLUMN assessment_indication_goals.previous_glp1_use IS
    'Whether patient has previously used a GLP-1 receptor agonist.';
COMMENT ON COLUMN assessment_indication_goals.previous_glp1_details IS
    'Details of previous GLP-1 RA use including name, dose, duration, and outcome.';
COMMENT ON COLUMN assessment_indication_goals.patient_motivation IS
    'Assessed patient motivation level: high, moderate, low, or empty string.';
COMMENT ON COLUMN assessment_indication_goals.realistic_expectations_discussed IS
    'Whether realistic treatment expectations have been discussed with the patient.';

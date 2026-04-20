-- 06_assessment_nutritional_screening.sql
-- MUST (Malnutrition Universal Screening Tool) section of the nutrition assessment.

CREATE TABLE assessment_nutritional_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    must_step1_bmi_score INTEGER NOT NULL DEFAULT 0
        CHECK (must_step1_bmi_score IN (0, 1, 2)),
    must_step2_weight_loss_score INTEGER NOT NULL DEFAULT 0
        CHECK (must_step2_weight_loss_score IN (0, 1, 2)),
    must_step3_acute_disease_score INTEGER NOT NULL DEFAULT 0
        CHECK (must_step3_acute_disease_score IN (0, 2)),
    must_total_score INTEGER NOT NULL DEFAULT 0
        CHECK (must_total_score >= 0 AND must_total_score <= 6),
    must_risk_category VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (must_risk_category IN ('low', 'medium', 'high', '')),
    acutely_ill VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (acutely_ill IN ('yes', 'no', '')),
    no_nutritional_intake_days INTEGER
        CHECK (no_nutritional_intake_days IS NULL OR no_nutritional_intake_days >= 0),
    screening_date DATE,
    screened_by VARCHAR(255) NOT NULL DEFAULT '',
    nutritional_screening_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_nutritional_screening_updated_at
    BEFORE UPDATE ON assessment_nutritional_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_nutritional_screening IS
    'MUST nutritional screening section: BMI score, weight loss score, acute disease score, and overall risk. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_nutritional_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_nutritional_screening.must_step1_bmi_score IS
    'MUST Step 1 BMI score: 0 (BMI >20), 1 (BMI 18.5-20), 2 (BMI <18.5).';
COMMENT ON COLUMN assessment_nutritional_screening.must_step2_weight_loss_score IS
    'MUST Step 2 unplanned weight loss score: 0 (<5%), 1 (5-10%), 2 (>10%).';
COMMENT ON COLUMN assessment_nutritional_screening.must_step3_acute_disease_score IS
    'MUST Step 3 acute disease effect score: 0 (none) or 2 (acutely ill with no nutritional intake >5 days).';
COMMENT ON COLUMN assessment_nutritional_screening.must_total_score IS
    'MUST total score (sum of steps 1-3): 0 = low risk, 1 = medium risk, >=2 = high risk.';
COMMENT ON COLUMN assessment_nutritional_screening.must_risk_category IS
    'MUST overall risk category: low, medium, high, or empty.';
COMMENT ON COLUMN assessment_nutritional_screening.acutely_ill IS
    'Whether the patient is acutely ill: yes, no, or empty.';
COMMENT ON COLUMN assessment_nutritional_screening.no_nutritional_intake_days IS
    'Number of days with no or negligible nutritional intake.';
COMMENT ON COLUMN assessment_nutritional_screening.screening_date IS
    'Date the MUST screening was performed.';
COMMENT ON COLUMN assessment_nutritional_screening.screened_by IS
    'Name of the clinician who performed the screening.';
COMMENT ON COLUMN assessment_nutritional_screening.nutritional_screening_notes IS
    'Additional clinician notes on nutritional screening.';

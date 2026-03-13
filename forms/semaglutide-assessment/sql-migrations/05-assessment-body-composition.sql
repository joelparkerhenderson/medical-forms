-- 05_assessment_body_composition.sql
-- Body composition section of the semaglutide assessment.

CREATE TABLE assessment_body_composition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_weight_kg NUMERIC(5,1)
        CHECK (current_weight_kg IS NULL OR current_weight_kg > 0),
    height_cm NUMERIC(5,1)
        CHECK (height_cm IS NULL OR height_cm > 0),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR bmi > 0),
    waist_circumference_cm NUMERIC(5,1)
        CHECK (waist_circumference_cm IS NULL OR waist_circumference_cm > 0),
    hip_circumference_cm NUMERIC(5,1)
        CHECK (hip_circumference_cm IS NULL OR hip_circumference_cm > 0),
    waist_hip_ratio NUMERIC(4,2)
        CHECK (waist_hip_ratio IS NULL OR waist_hip_ratio > 0),
    body_fat_percentage NUMERIC(4,1)
        CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100)),
    highest_lifetime_weight_kg NUMERIC(5,1)
        CHECK (highest_lifetime_weight_kg IS NULL OR highest_lifetime_weight_kg > 0),
    weight_change_last_6_months_kg NUMERIC(5,1),
    bmi_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (bmi_category IN ('underweight', 'normal', 'overweight', 'obese_class_1', 'obese_class_2', 'obese_class_3', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_body_composition_updated_at
    BEFORE UPDATE ON assessment_body_composition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_body_composition IS
    'Body composition section: anthropometric measurements and weight history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_body_composition.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_body_composition.current_weight_kg IS
    'Current body weight in kilograms.';
COMMENT ON COLUMN assessment_body_composition.height_cm IS
    'Height in centimetres.';
COMMENT ON COLUMN assessment_body_composition.bmi IS
    'Body mass index (kg/m^2). BMI >= 30 (or >= 27 with comorbidity) required for eligibility.';
COMMENT ON COLUMN assessment_body_composition.waist_circumference_cm IS
    'Waist circumference in centimetres.';
COMMENT ON COLUMN assessment_body_composition.hip_circumference_cm IS
    'Hip circumference in centimetres.';
COMMENT ON COLUMN assessment_body_composition.waist_hip_ratio IS
    'Waist-to-hip ratio, indicator of central adiposity.';
COMMENT ON COLUMN assessment_body_composition.body_fat_percentage IS
    'Body fat percentage if measured.';
COMMENT ON COLUMN assessment_body_composition.highest_lifetime_weight_kg IS
    'Highest recorded lifetime weight in kilograms.';
COMMENT ON COLUMN assessment_body_composition.weight_change_last_6_months_kg IS
    'Weight change in past 6 months in kg (positive=gain, negative=loss).';
COMMENT ON COLUMN assessment_body_composition.bmi_category IS
    'BMI classification: underweight, normal, overweight, obese_class_1/2/3, or empty string.';

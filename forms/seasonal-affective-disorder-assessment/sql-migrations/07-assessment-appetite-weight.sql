-- 07_assessment_appetite_weight.sql
-- Appetite and weight changes section of the seasonal affective disorder assessment.

CREATE TABLE assessment_appetite_weight (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    appetite_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite_change IN ('increased', 'decreased', 'no-change', '')),
    carbohydrate_craving VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carbohydrate_craving IN ('yes', 'no', '')),
    carbohydrate_craving_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (carbohydrate_craving_severity IN ('mild', 'moderate', 'severe', '')),
    chocolate_craving VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chocolate_craving IN ('yes', 'no', '')),
    weight_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_change IN ('gained', 'lost', 'no-change', '')),
    weight_change_kg NUMERIC(5,1)
        CHECK (weight_change_kg IS NULL OR weight_change_kg >= 0),
    weight_change_period VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_change_period IN ('last-month', 'last-3-months', 'last-6-months', 'last-year', '')),
    seasonal_weight_pattern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seasonal_weight_pattern IN ('yes', 'no', '')),
    appetite_weight_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_appetite_weight_updated_at
    BEFORE UPDATE ON assessment_appetite_weight
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_appetite_weight IS
    'Appetite and weight changes section: cravings, weight fluctuations, and seasonal patterns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_appetite_weight.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_appetite_weight.appetite_change IS
    'Direction of appetite change: increased, decreased, no-change, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.carbohydrate_craving IS
    'Whether the patient has carbohydrate cravings: yes, no, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.carbohydrate_craving_severity IS
    'Severity of carbohydrate cravings: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.chocolate_craving IS
    'Whether the patient has chocolate or sweet cravings: yes, no, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.weight_change IS
    'Direction of weight change: gained, lost, no-change, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.weight_change_kg IS
    'Amount of weight change in kilograms.';
COMMENT ON COLUMN assessment_appetite_weight.weight_change_period IS
    'Period over which weight change occurred: last-month, last-3-months, last-6-months, last-year, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.seasonal_weight_pattern IS
    'Whether the patient notices a seasonal pattern to weight changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_appetite_weight.appetite_weight_notes IS
    'Additional clinician notes on appetite and weight changes.';

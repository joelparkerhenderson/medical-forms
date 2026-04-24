CREATE TABLE smoking_alcohol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('nonSmoker', 'exSmoker', 'lightSmoker', 'moderateSmoker', 'heavySmoker', '')),
    cigarettes_per_day SMALLINT
        CHECK (cigarettes_per_day IS NULL OR (cigarettes_per_day >= 0 AND cigarettes_per_day <= 200)),
    years_since_quit SMALLINT
        CHECK (years_since_quit IS NULL OR (years_since_quit >= 0 AND years_since_quit <= 100)),
    alcohol_units_per_week NUMERIC(6, 2)
        CHECK (alcohol_units_per_week IS NULL OR (alcohol_units_per_week >= 0 AND alcohol_units_per_week <= 500)),
    alcohol_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (alcohol_frequency IN ('never', 'monthly', 'twoToFourPerMonth', 'twoToThreePerWeek', 'fourOrMorePerWeek', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_smoking_alcohol_updated_at
    BEFORE UPDATE ON smoking_alcohol
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE smoking_alcohol IS
    'Tobacco and alcohol consumption data.';
COMMENT ON COLUMN smoking_alcohol.smoking_status IS
    'Smoking status: nonSmoker, exSmoker, lightSmoker, moderateSmoker, heavySmoker, or empty.';
COMMENT ON COLUMN smoking_alcohol.cigarettes_per_day IS
    'Number of cigarettes smoked per day (current smokers only).';
COMMENT ON COLUMN smoking_alcohol.years_since_quit IS
    'Years since quitting smoking (ex-smokers only).';
COMMENT ON COLUMN smoking_alcohol.alcohol_units_per_week IS
    'Alcohol consumption in UK units per week.';
COMMENT ON COLUMN smoking_alcohol.alcohol_frequency IS
    'Frequency of alcohol consumption.';

COMMENT ON COLUMN smoking_alcohol.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN smoking_alcohol.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN smoking_alcohol.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN smoking_alcohol.updated_at IS
    'Timestamp when this row was last updated.';

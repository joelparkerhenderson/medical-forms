-- 10_assessment_smoking_exposures.sql
-- Smoking and exposures section of the respirology assessment.

CREATE TABLE assessment_smoking_exposures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'former', 'current', '')),
    pack_years NUMERIC(5,1)
        CHECK (pack_years IS NULL OR pack_years >= 0),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    age_started_smoking INTEGER
        CHECK (age_started_smoking IS NULL OR (age_started_smoking >= 0 AND age_started_smoking <= 120)),
    age_stopped_smoking INTEGER
        CHECK (age_stopped_smoking IS NULL OR (age_stopped_smoking >= 0 AND age_stopped_smoking <= 120)),
    vaping VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaping IN ('yes', 'no', '')),
    vaping_details TEXT NOT NULL DEFAULT '',
    cannabis_smoking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cannabis_smoking IN ('yes', 'no', '')),
    passive_smoke_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (passive_smoke_exposure IN ('yes', 'no', '')),
    occupational_exposures VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_exposures IN ('yes', 'no', '')),
    occupational_exposure_details TEXT NOT NULL DEFAULT '',
    asbestos_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asbestos_exposure IN ('yes', 'no', '')),
    silica_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (silica_exposure IN ('yes', 'no', '')),
    biomass_fuel_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (biomass_fuel_exposure IN ('yes', 'no', '')),
    indoor_air_quality_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (indoor_air_quality_concerns IN ('yes', 'no', '')),
    air_quality_details TEXT NOT NULL DEFAULT '',
    smoking_cessation_advice VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (smoking_cessation_advice IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_smoking_exposures_updated_at
    BEFORE UPDATE ON assessment_smoking_exposures
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_smoking_exposures IS
    'Smoking and exposures section: smoking history, pack-years, vaping, occupational and environmental exposures. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_smoking_exposures.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_smoking_exposures.smoking_status IS
    'Smoking status: never, former, current, or empty.';
COMMENT ON COLUMN assessment_smoking_exposures.pack_years IS
    'Cumulative smoking exposure in pack-years.';
COMMENT ON COLUMN assessment_smoking_exposures.cigarettes_per_day IS
    'Number of cigarettes smoked per day.';
COMMENT ON COLUMN assessment_smoking_exposures.age_started_smoking IS
    'Age when the patient started smoking.';
COMMENT ON COLUMN assessment_smoking_exposures.vaping IS
    'Whether the patient uses e-cigarettes or vapes.';
COMMENT ON COLUMN assessment_smoking_exposures.occupational_exposures IS
    'Whether the patient has had occupational respiratory exposures.';
COMMENT ON COLUMN assessment_smoking_exposures.asbestos_exposure IS
    'Whether the patient has had asbestos exposure.';
COMMENT ON COLUMN assessment_smoking_exposures.biomass_fuel_exposure IS
    'Whether the patient has had biomass fuel exposure.';
COMMENT ON COLUMN assessment_smoking_exposures.indoor_air_quality_concerns IS
    'Whether there are concerns about indoor air quality (mould, damp, chemicals).';

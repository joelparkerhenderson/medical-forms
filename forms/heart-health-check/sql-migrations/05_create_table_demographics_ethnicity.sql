CREATE TABLE demographics_ethnicity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age SMALLINT
        CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', '')),
    ethnicity VARCHAR(30) NOT NULL DEFAULT '',
    townsend_deprivation NUMERIC(5, 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_demographics_ethnicity_updated_at
    BEFORE UPDATE ON demographics_ethnicity
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE demographics_ethnicity IS
    'Demographics and ethnicity for QRISK3 risk calculation.';
COMMENT ON COLUMN demographics_ethnicity.age IS
    'Patient age in years.';
COMMENT ON COLUMN demographics_ethnicity.sex IS
    'Patient sex: male, female, or empty string if unanswered.';
COMMENT ON COLUMN demographics_ethnicity.ethnicity IS
    'Ethnicity category for risk calculation.';
COMMENT ON COLUMN demographics_ethnicity.townsend_deprivation IS
    'Townsend deprivation score (-8 to 12).';

COMMENT ON COLUMN demographics_ethnicity.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN demographics_ethnicity.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN demographics_ethnicity.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN demographics_ethnicity.updated_at IS
    'Timestamp when this row was last updated.';

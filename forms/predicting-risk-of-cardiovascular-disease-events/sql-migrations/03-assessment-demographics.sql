-- ============================================================
-- 03_assessment_demographics.sql
-- Step 2: Demographics (1:1 with assessment).
-- ============================================================
-- Age, sex, ethnicity, body measurements, and location.
-- Age and sex are the primary inputs to the PREVENT risk model.
-- ============================================================

CREATE TABLE assessment_demographics (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Demographics fields
    age                 SMALLINT CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
    sex                 TEXT NOT NULL DEFAULT ''
                        CHECK (sex IN ('male', 'female', '')),
    ethnicity           TEXT NOT NULL DEFAULT ''
                        CHECK (ethnicity IN ('white', 'black', 'hispanic', 'asian', 'native', 'mixed', 'other', '')),
    height_cm           NUMERIC(5,1) CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 250)),
    weight_kg           NUMERIC(5,1) CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 400)),
    zip_code            TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    '1:1 with assessment. Step 2: Demographics - age, sex, ethnicity, body measurements.';
COMMENT ON COLUMN assessment_demographics.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_demographics.age IS
    'Patient age in years (30-79 validated range for PREVENT). NULL if unanswered.';
COMMENT ON COLUMN assessment_demographics.sex IS
    'Biological sex: male, female, or empty string if unanswered. Sex-specific coefficients in risk model.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Self-reported ethnicity. Empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.height_cm IS
    'Height in centimetres. NULL if not recorded. Used for BMI calculation.';
COMMENT ON COLUMN assessment_demographics.weight_kg IS
    'Weight in kilograms. NULL if not recorded. Used for BMI calculation.';
COMMENT ON COLUMN assessment_demographics.zip_code IS
    'ZIP or postal code. Empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_demographics.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

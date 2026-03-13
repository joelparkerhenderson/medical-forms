-- 08_assessment_substance_use.sql
-- Substance use section of the mental health assessment.

CREATE TABLE assessment_substance_use (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'social', 'moderate', 'heavy', 'dependent', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    alcohol_concern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alcohol_concern IN ('yes', 'no', '')),
    tobacco_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tobacco_use IN ('never', 'former', 'current', '')),
    tobacco_per_day INTEGER
        CHECK (tobacco_per_day IS NULL OR tobacco_per_day >= 0),
    cannabis_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cannabis_use IN ('never', 'former', 'occasional', 'regular', '')),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    recreational_drug_details TEXT NOT NULL DEFAULT '',
    prescription_misuse VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (prescription_misuse IN ('yes', 'no', '')),
    prescription_misuse_details TEXT NOT NULL DEFAULT '',
    caffeine_intake VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (caffeine_intake IN ('none', 'moderate', 'high', '')),
    previous_substance_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_substance_treatment IN ('yes', 'no', '')),
    previous_substance_treatment_details TEXT NOT NULL DEFAULT '',
    substance_use_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_substance_use_updated_at
    BEFORE UPDATE ON assessment_substance_use
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_substance_use IS
    'Substance use section: alcohol, tobacco, cannabis, recreational drugs, and prescription misuse. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_substance_use.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_substance_use.alcohol_use IS
    'Alcohol consumption level: none, social, moderate, heavy, dependent, or empty string.';
COMMENT ON COLUMN assessment_substance_use.alcohol_units_per_week IS
    'Estimated alcohol units consumed per week.';
COMMENT ON COLUMN assessment_substance_use.alcohol_concern IS
    'Whether the patient or clinician has concerns about alcohol use: yes, no, or empty string.';
COMMENT ON COLUMN assessment_substance_use.tobacco_use IS
    'Tobacco use status: never, former, current, or empty string.';
COMMENT ON COLUMN assessment_substance_use.tobacco_per_day IS
    'Number of cigarettes (or equivalent) per day, if applicable.';
COMMENT ON COLUMN assessment_substance_use.cannabis_use IS
    'Cannabis use: never, former, occasional, regular, or empty string.';
COMMENT ON COLUMN assessment_substance_use.recreational_drug_use IS
    'Whether the patient uses recreational drugs: yes, no, or empty string.';
COMMENT ON COLUMN assessment_substance_use.recreational_drug_details IS
    'Free-text details of recreational drug use (substances, frequency).';
COMMENT ON COLUMN assessment_substance_use.prescription_misuse IS
    'Whether the patient misuses prescription medication: yes, no, or empty string.';
COMMENT ON COLUMN assessment_substance_use.prescription_misuse_details IS
    'Free-text details of prescription medication misuse.';
COMMENT ON COLUMN assessment_substance_use.caffeine_intake IS
    'Caffeine intake level: none, moderate, high, or empty string.';
COMMENT ON COLUMN assessment_substance_use.previous_substance_treatment IS
    'Whether the patient has previous substance abuse treatment: yes, no, or empty string.';
COMMENT ON COLUMN assessment_substance_use.previous_substance_treatment_details IS
    'Free-text details of previous substance treatment.';
COMMENT ON COLUMN assessment_substance_use.substance_use_notes IS
    'Free-text clinician notes on substance use.';

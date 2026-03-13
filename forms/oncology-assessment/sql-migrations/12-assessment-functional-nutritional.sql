-- 12_assessment_functional_nutritional.sql
-- Functional and nutritional section of the oncology assessment.

CREATE TABLE assessment_functional_nutritional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ecog_performance_status INTEGER
        CHECK (ecog_performance_status IS NULL OR (ecog_performance_status >= 0 AND ecog_performance_status <= 5)),
    karnofsky_score INTEGER
        CHECK (karnofsky_score IS NULL OR (karnofsky_score >= 0 AND karnofsky_score <= 100)),
    mobility_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (mobility_level IN ('fully-mobile', 'mobile-with-aid', 'wheelchair', 'bed-bound', '')),
    adl_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adl_independence IN ('independent', 'needs-some-help', 'needs-significant-help', 'fully-dependent', '')),
    weight_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_change IN ('stable', 'gained', 'lost-less-5-percent', 'lost-5-to-10-percent', 'lost-more-10-percent', '')),
    weight_kg NUMERIC(5,1)
        CHECK (weight_kg IS NULL OR weight_kg > 0),
    height_cm NUMERIC(5,1)
        CHECK (height_cm IS NULL OR height_cm > 0),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR bmi > 0),
    nutritional_risk VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (nutritional_risk IN ('low', 'moderate', 'high', '')),
    oral_intake VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (oral_intake IN ('normal', 'reduced', 'minimal', 'nil-by-mouth', '')),
    nutritional_support VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (nutritional_support IN ('none', 'oral-supplements', 'enteral-feeding', 'parenteral-nutrition', '')),
    dietitian_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dietitian_referral IN ('yes', 'no', '')),
    functional_nutritional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_nutritional_updated_at
    BEFORE UPDATE ON assessment_functional_nutritional
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_nutritional IS
    'Functional and nutritional section: ECOG status, Karnofsky score, mobility, ADL independence, weight, and nutritional risk. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_nutritional.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_nutritional.ecog_performance_status IS
    'ECOG Performance Status: 0 = Fully active, 1 = Restricted, 2 = Ambulatory, 3 = Limited self-care, 4 = Completely disabled, 5 = Dead.';
COMMENT ON COLUMN assessment_functional_nutritional.karnofsky_score IS
    'Karnofsky Performance Status score (0-100, in increments of 10).';
COMMENT ON COLUMN assessment_functional_nutritional.mobility_level IS
    'Mobility level: fully-mobile, mobile-with-aid, wheelchair, bed-bound, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.adl_independence IS
    'Activities of daily living independence: independent, needs-some-help, needs-significant-help, fully-dependent, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.weight_change IS
    'Recent weight change: stable, gained, lost-less-5-percent, lost-5-to-10-percent, lost-more-10-percent, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.weight_kg IS
    'Current weight in kilograms.';
COMMENT ON COLUMN assessment_functional_nutritional.height_cm IS
    'Height in centimetres.';
COMMENT ON COLUMN assessment_functional_nutritional.bmi IS
    'Body mass index calculated from weight and height.';
COMMENT ON COLUMN assessment_functional_nutritional.nutritional_risk IS
    'Nutritional risk level: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.oral_intake IS
    'Current oral intake level: normal, reduced, minimal, nil-by-mouth, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.nutritional_support IS
    'Type of nutritional support: none, oral-supplements, enteral-feeding, parenteral-nutrition, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.dietitian_referral IS
    'Whether a dietitian referral has been made: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_nutritional.functional_nutritional_notes IS
    'Additional clinician notes on functional and nutritional status.';

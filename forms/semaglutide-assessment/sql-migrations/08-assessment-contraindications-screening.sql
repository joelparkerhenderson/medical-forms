-- 08_assessment_contraindications_screening.sql
-- Contraindications screening section of the semaglutide assessment.

CREATE TABLE assessment_contraindications_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Absolute contraindications
    personal_medullary_thyroid_carcinoma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (personal_medullary_thyroid_carcinoma IN ('yes', 'no', '')),
    family_medullary_thyroid_carcinoma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_medullary_thyroid_carcinoma IN ('yes', 'no', '')),
    men2_syndrome VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (men2_syndrome IN ('yes', 'no', '')),
    type1_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (type1_diabetes IN ('yes', 'no', '')),
    pregnancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pregnancy IN ('yes', 'no', '')),
    breastfeeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breastfeeding IN ('yes', 'no', '')),
    planning_pregnancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (planning_pregnancy IN ('yes', 'no', '')),

    -- Relative contraindications
    history_of_pancreatitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_pancreatitis IN ('yes', 'no', '')),
    gallbladder_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gallbladder_disease IN ('yes', 'no', '')),
    severe_renal_impairment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (severe_renal_impairment IN ('yes', 'no', '')),
    egfr_ml_min NUMERIC(5,1)
        CHECK (egfr_ml_min IS NULL OR egfr_ml_min >= 0),
    diabetic_retinopathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetic_retinopathy IN ('yes', 'no', '')),
    history_of_eating_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_eating_disorder IN ('yes', 'no', '')),
    known_hypersensitivity_glp1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_hypersensitivity_glp1 IN ('yes', 'no', '')),
    additional_contraindications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contraindications_screening_updated_at
    BEFORE UPDATE ON assessment_contraindications_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contraindications_screening IS
    'Contraindications screening section: absolute and relative contraindications to semaglutide therapy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contraindications_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contraindications_screening.personal_medullary_thyroid_carcinoma IS
    'Whether patient has personal history of medullary thyroid carcinoma (absolute contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.family_medullary_thyroid_carcinoma IS
    'Whether there is a family history of medullary thyroid carcinoma (absolute contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.men2_syndrome IS
    'Whether patient has multiple endocrine neoplasia type 2 syndrome (absolute contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.type1_diabetes IS
    'Whether patient has type 1 diabetes (absolute contraindication for weight indication).';
COMMENT ON COLUMN assessment_contraindications_screening.pregnancy IS
    'Whether patient is currently pregnant (absolute contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.breastfeeding IS
    'Whether patient is currently breastfeeding (absolute contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.planning_pregnancy IS
    'Whether patient is planning pregnancy within 2 months (requires discontinuation).';
COMMENT ON COLUMN assessment_contraindications_screening.history_of_pancreatitis IS
    'Whether patient has a history of pancreatitis (relative contraindication).';
COMMENT ON COLUMN assessment_contraindications_screening.gallbladder_disease IS
    'Whether patient has gallbladder disease or history of cholecystectomy.';
COMMENT ON COLUMN assessment_contraindications_screening.severe_renal_impairment IS
    'Whether patient has severe renal impairment (eGFR < 15 mL/min).';
COMMENT ON COLUMN assessment_contraindications_screening.egfr_ml_min IS
    'Estimated glomerular filtration rate in mL/min/1.73m^2.';
COMMENT ON COLUMN assessment_contraindications_screening.diabetic_retinopathy IS
    'Whether patient has diabetic retinopathy (rapid glycaemic improvement may worsen).';
COMMENT ON COLUMN assessment_contraindications_screening.history_of_eating_disorder IS
    'Whether patient has a history of eating disorder.';
COMMENT ON COLUMN assessment_contraindications_screening.known_hypersensitivity_glp1 IS
    'Whether patient has known hypersensitivity to any GLP-1 receptor agonist.';
COMMENT ON COLUMN assessment_contraindications_screening.additional_contraindications IS
    'Free-text description of any additional contraindications or concerns.';

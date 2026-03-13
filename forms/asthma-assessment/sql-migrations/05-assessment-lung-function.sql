-- 05_assessment_lung_function.sql
-- Lung function section of the asthma assessment.

CREATE TABLE assessment_lung_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    fev1_litres NUMERIC(4,2)
        CHECK (fev1_litres IS NULL OR fev1_litres >= 0),
    fev1_percent_predicted NUMERIC(5,1)
        CHECK (fev1_percent_predicted IS NULL OR fev1_percent_predicted >= 0),
    fvc_litres NUMERIC(4,2)
        CHECK (fvc_litres IS NULL OR fvc_litres >= 0),
    fev1_fvc_ratio NUMERIC(5,2)
        CHECK (fev1_fvc_ratio IS NULL OR (fev1_fvc_ratio >= 0 AND fev1_fvc_ratio <= 100)),
    pef_litres_per_min NUMERIC(6,1)
        CHECK (pef_litres_per_min IS NULL OR pef_litres_per_min >= 0),
    pef_percent_predicted NUMERIC(5,1)
        CHECK (pef_percent_predicted IS NULL OR pef_percent_predicted >= 0),
    pef_variability_percent NUMERIC(5,1)
        CHECK (pef_variability_percent IS NULL OR pef_variability_percent >= 0),
    reversibility_test_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reversibility_test_done IN ('yes', 'no', '')),
    reversibility_percent NUMERIC(5,1)
        CHECK (reversibility_percent IS NULL OR reversibility_percent >= 0),
    spirometry_date DATE,
    spirometry_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lung_function_updated_at
    BEFORE UPDATE ON assessment_lung_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lung_function IS
    'Lung function section: spirometry and peak flow measurements. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lung_function.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lung_function.fev1_litres IS
    'Forced expiratory volume in 1 second, in litres.';
COMMENT ON COLUMN assessment_lung_function.fev1_percent_predicted IS
    'FEV1 as percentage of predicted value for age, sex, and height.';
COMMENT ON COLUMN assessment_lung_function.fvc_litres IS
    'Forced vital capacity, in litres.';
COMMENT ON COLUMN assessment_lung_function.fev1_fvc_ratio IS
    'Ratio of FEV1 to FVC, expressed as a percentage.';
COMMENT ON COLUMN assessment_lung_function.pef_litres_per_min IS
    'Peak expiratory flow rate, in litres per minute.';
COMMENT ON COLUMN assessment_lung_function.pef_percent_predicted IS
    'PEF as percentage of predicted value.';
COMMENT ON COLUMN assessment_lung_function.pef_variability_percent IS
    'Diurnal PEF variability as a percentage; greater than 20% suggests asthma.';
COMMENT ON COLUMN assessment_lung_function.reversibility_test_done IS
    'Whether a bronchodilator reversibility test was performed.';
COMMENT ON COLUMN assessment_lung_function.reversibility_percent IS
    'Percentage improvement in FEV1 after bronchodilator; 12% or greater supports asthma diagnosis.';
COMMENT ON COLUMN assessment_lung_function.spirometry_date IS
    'Date spirometry was performed, NULL if unanswered.';
COMMENT ON COLUMN assessment_lung_function.spirometry_notes IS
    'Additional notes about spirometry or peak flow results.';

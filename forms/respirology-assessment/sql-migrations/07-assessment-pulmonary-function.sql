-- 07_assessment_pulmonary_function.sql
-- Pulmonary function section of the respirology assessment.

CREATE TABLE assessment_pulmonary_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    spirometry_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (spirometry_performed IN ('yes', 'no', '')),
    test_date DATE,
    fev1_litres NUMERIC(4,2)
        CHECK (fev1_litres IS NULL OR fev1_litres > 0),
    fev1_predicted_pct NUMERIC(5,1)
        CHECK (fev1_predicted_pct IS NULL OR (fev1_predicted_pct >= 0 AND fev1_predicted_pct <= 200)),
    fvc_litres NUMERIC(4,2)
        CHECK (fvc_litres IS NULL OR fvc_litres > 0),
    fvc_predicted_pct NUMERIC(5,1)
        CHECK (fvc_predicted_pct IS NULL OR (fvc_predicted_pct >= 0 AND fvc_predicted_pct <= 200)),
    fev1_fvc_ratio NUMERIC(4,2)
        CHECK (fev1_fvc_ratio IS NULL OR (fev1_fvc_ratio >= 0 AND fev1_fvc_ratio <= 1.0)),
    peak_flow_lmin INTEGER
        CHECK (peak_flow_lmin IS NULL OR peak_flow_lmin > 0),
    peak_flow_variability_pct NUMERIC(5,1)
        CHECK (peak_flow_variability_pct IS NULL OR peak_flow_variability_pct >= 0),
    dlco_pct NUMERIC(5,1)
        CHECK (dlco_pct IS NULL OR (dlco_pct >= 0 AND dlco_pct <= 200)),
    total_lung_capacity_pct NUMERIC(5,1)
        CHECK (total_lung_capacity_pct IS NULL OR (total_lung_capacity_pct >= 0 AND total_lung_capacity_pct <= 200)),
    residual_volume_pct NUMERIC(5,1)
        CHECK (residual_volume_pct IS NULL OR (residual_volume_pct >= 0 AND residual_volume_pct <= 400)),
    bronchodilator_reversibility VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bronchodilator_reversibility IN ('yes', 'no', '')),
    methacholine_challenge VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (methacholine_challenge IN ('positive', 'negative', 'not-done', '')),
    oxygen_saturation_rest NUMERIC(4,1)
        CHECK (oxygen_saturation_rest IS NULL OR (oxygen_saturation_rest >= 50.0 AND oxygen_saturation_rest <= 100.0)),
    arterial_blood_gas_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (arterial_blood_gas_performed IN ('yes', 'no', '')),
    pao2_kpa NUMERIC(4,1)
        CHECK (pao2_kpa IS NULL OR pao2_kpa > 0),
    paco2_kpa NUMERIC(4,1)
        CHECK (paco2_kpa IS NULL OR paco2_kpa > 0),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_pulmonary_function_updated_at
    BEFORE UPDATE ON assessment_pulmonary_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pulmonary_function IS
    'Pulmonary function section: spirometry, lung volumes, diffusion capacity, bronchodilator response, and blood gases. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_pulmonary_function.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_pulmonary_function.spirometry_performed IS
    'Whether spirometry was performed.';
COMMENT ON COLUMN assessment_pulmonary_function.fev1_litres IS
    'Forced expiratory volume in 1 second (FEV1) in litres.';
COMMENT ON COLUMN assessment_pulmonary_function.fev1_predicted_pct IS
    'FEV1 as percentage of predicted value.';
COMMENT ON COLUMN assessment_pulmonary_function.fvc_litres IS
    'Forced vital capacity (FVC) in litres.';
COMMENT ON COLUMN assessment_pulmonary_function.fev1_fvc_ratio IS
    'FEV1/FVC ratio.';
COMMENT ON COLUMN assessment_pulmonary_function.peak_flow_lmin IS
    'Peak expiratory flow rate in litres per minute.';
COMMENT ON COLUMN assessment_pulmonary_function.peak_flow_variability_pct IS
    'Peak flow variability percentage (relevant for asthma diagnosis).';
COMMENT ON COLUMN assessment_pulmonary_function.dlco_pct IS
    'Diffusing capacity of the lung for carbon monoxide as percentage of predicted.';
COMMENT ON COLUMN assessment_pulmonary_function.total_lung_capacity_pct IS
    'Total lung capacity as percentage of predicted.';
COMMENT ON COLUMN assessment_pulmonary_function.residual_volume_pct IS
    'Residual volume as percentage of predicted.';
COMMENT ON COLUMN assessment_pulmonary_function.bronchodilator_reversibility IS
    'Whether significant bronchodilator reversibility was demonstrated.';
COMMENT ON COLUMN assessment_pulmonary_function.methacholine_challenge IS
    'Methacholine challenge test result: positive, negative, not-done, or empty.';
COMMENT ON COLUMN assessment_pulmonary_function.pao2_kpa IS
    'Arterial partial pressure of oxygen (PaO2) in kPa.';
COMMENT ON COLUMN assessment_pulmonary_function.paco2_kpa IS
    'Arterial partial pressure of carbon dioxide (PaCO2) in kPa.';

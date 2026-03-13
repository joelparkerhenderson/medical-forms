-- 04_assessment_spirometry.sql
-- Spirometry results section of the pulmonology assessment.

CREATE TABLE assessment_spirometry (
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
    post_bronchodilator_fev1 NUMERIC(4,2)
        CHECK (post_bronchodilator_fev1 IS NULL OR post_bronchodilator_fev1 > 0),
    post_bronchodilator_fev1_pct NUMERIC(5,1)
        CHECK (post_bronchodilator_fev1_pct IS NULL OR (post_bronchodilator_fev1_pct >= 0 AND post_bronchodilator_fev1_pct <= 200)),
    bronchodilator_reversibility VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bronchodilator_reversibility IN ('yes', 'no', '')),
    reversibility_pct NUMERIC(5,1)
        CHECK (reversibility_pct IS NULL OR reversibility_pct >= 0),
    peak_flow_lmin INTEGER
        CHECK (peak_flow_lmin IS NULL OR peak_flow_lmin > 0),
    dlco_pct NUMERIC(5,1)
        CHECK (dlco_pct IS NULL OR (dlco_pct >= 0 AND dlco_pct <= 200)),
    test_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (test_quality IN ('acceptable', 'suboptimal', 'unacceptable', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_spirometry_updated_at
    BEFORE UPDATE ON assessment_spirometry
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_spirometry IS
    'Spirometry results section: FEV1, FVC, FEV1/FVC ratio, bronchodilator reversibility, peak flow, and DLCO. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_spirometry.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_spirometry.spirometry_performed IS
    'Whether spirometry testing was performed.';
COMMENT ON COLUMN assessment_spirometry.fev1_litres IS
    'Forced expiratory volume in 1 second (FEV1) in litres.';
COMMENT ON COLUMN assessment_spirometry.fev1_predicted_pct IS
    'FEV1 as percentage of predicted value.';
COMMENT ON COLUMN assessment_spirometry.fvc_litres IS
    'Forced vital capacity (FVC) in litres.';
COMMENT ON COLUMN assessment_spirometry.fvc_predicted_pct IS
    'FVC as percentage of predicted value.';
COMMENT ON COLUMN assessment_spirometry.fev1_fvc_ratio IS
    'FEV1/FVC ratio (values below 0.7 indicate obstruction).';
COMMENT ON COLUMN assessment_spirometry.post_bronchodilator_fev1 IS
    'FEV1 in litres after bronchodilator administration.';
COMMENT ON COLUMN assessment_spirometry.post_bronchodilator_fev1_pct IS
    'Post-bronchodilator FEV1 as percentage of predicted.';
COMMENT ON COLUMN assessment_spirometry.bronchodilator_reversibility IS
    'Whether significant bronchodilator reversibility was demonstrated (>12% and >200ml improvement).';
COMMENT ON COLUMN assessment_spirometry.peak_flow_lmin IS
    'Peak expiratory flow rate in litres per minute.';
COMMENT ON COLUMN assessment_spirometry.dlco_pct IS
    'Diffusing capacity of the lung for carbon monoxide (DLCO) as percentage of predicted.';
COMMENT ON COLUMN assessment_spirometry.test_quality IS
    'Quality of spirometry test: acceptable, suboptimal, unacceptable, or empty.';

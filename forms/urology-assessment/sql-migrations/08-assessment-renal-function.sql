-- 08_assessment_renal_function.sql
-- Renal function section of the urology assessment.

CREATE TABLE assessment_renal_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    creatinine_umol_l NUMERIC(6,1)
        CHECK (creatinine_umol_l IS NULL OR creatinine_umol_l >= 0),
    egfr_ml_min NUMERIC(5,1)
        CHECK (egfr_ml_min IS NULL OR egfr_ml_min >= 0),
    urea_mmol_l NUMERIC(5,1)
        CHECK (urea_mmol_l IS NULL OR urea_mmol_l >= 0),
    psa_ng_ml NUMERIC(6,2)
        CHECK (psa_ng_ml IS NULL OR psa_ng_ml >= 0),
    psa_previous_value NUMERIC(6,2)
        CHECK (psa_previous_value IS NULL OR psa_previous_value >= 0),
    psa_previous_date DATE,
    urinalysis_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinalysis_performed IN ('yes', 'no', '')),
    urinalysis_leukocytes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (urinalysis_leukocytes IN ('negative', 'trace', 'positive', '')),
    urinalysis_nitrites VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (urinalysis_nitrites IN ('negative', 'positive', '')),
    urinalysis_blood VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (urinalysis_blood IN ('negative', 'trace', 'positive', '')),
    urinalysis_protein VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (urinalysis_protein IN ('negative', 'trace', 'positive', '')),
    post_void_residual_ml INTEGER
        CHECK (post_void_residual_ml IS NULL OR post_void_residual_ml >= 0),
    uroflowmetry_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uroflowmetry_performed IN ('yes', 'no', '')),
    max_flow_rate_ml_s NUMERIC(5,1)
        CHECK (max_flow_rate_ml_s IS NULL OR max_flow_rate_ml_s >= 0),
    ultrasound_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ultrasound_performed IN ('yes', 'no', '')),
    ultrasound_findings TEXT NOT NULL DEFAULT '',
    prostate_volume_ml NUMERIC(6,1)
        CHECK (prostate_volume_ml IS NULL OR prostate_volume_ml >= 0),
    lab_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_renal_function_updated_at
    BEFORE UPDATE ON assessment_renal_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_renal_function IS
    'Renal function section: blood tests, PSA, urinalysis, uroflowmetry, and imaging. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_renal_function.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_renal_function.creatinine_umol_l IS
    'Serum creatinine in umol/L.';
COMMENT ON COLUMN assessment_renal_function.egfr_ml_min IS
    'Estimated glomerular filtration rate in mL/min/1.73m^2.';
COMMENT ON COLUMN assessment_renal_function.urea_mmol_l IS
    'Blood urea in mmol/L.';
COMMENT ON COLUMN assessment_renal_function.psa_ng_ml IS
    'Prostate-specific antigen in ng/mL.';
COMMENT ON COLUMN assessment_renal_function.psa_previous_value IS
    'Previous PSA value for velocity calculation.';
COMMENT ON COLUMN assessment_renal_function.psa_previous_date IS
    'Date of previous PSA measurement.';
COMMENT ON COLUMN assessment_renal_function.urinalysis_performed IS
    'Whether urinalysis was performed.';
COMMENT ON COLUMN assessment_renal_function.urinalysis_leukocytes IS
    'Urinalysis leukocytes result: negative, trace, positive, or empty string.';
COMMENT ON COLUMN assessment_renal_function.urinalysis_nitrites IS
    'Urinalysis nitrites result: negative, positive, or empty string.';
COMMENT ON COLUMN assessment_renal_function.urinalysis_blood IS
    'Urinalysis blood result: negative, trace, positive, or empty string.';
COMMENT ON COLUMN assessment_renal_function.urinalysis_protein IS
    'Urinalysis protein result: negative, trace, positive, or empty string.';
COMMENT ON COLUMN assessment_renal_function.post_void_residual_ml IS
    'Post-void residual urine volume in millilitres.';
COMMENT ON COLUMN assessment_renal_function.uroflowmetry_performed IS
    'Whether uroflowmetry was performed.';
COMMENT ON COLUMN assessment_renal_function.max_flow_rate_ml_s IS
    'Maximum urinary flow rate in mL/s (Qmax).';
COMMENT ON COLUMN assessment_renal_function.ultrasound_performed IS
    'Whether renal/bladder ultrasound was performed.';
COMMENT ON COLUMN assessment_renal_function.ultrasound_findings IS
    'Free-text ultrasound findings.';
COMMENT ON COLUMN assessment_renal_function.prostate_volume_ml IS
    'Prostate volume in millilitres (from ultrasound or MRI).';
COMMENT ON COLUMN assessment_renal_function.lab_date IS
    'Date when laboratory tests were performed.';

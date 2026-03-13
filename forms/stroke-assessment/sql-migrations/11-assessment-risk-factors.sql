-- 11_assessment_risk_factors.sql
-- Risk factors section of the stroke assessment.

CREATE TABLE assessment_risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('yes', 'no', '')),
    atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (atrial_fibrillation IN ('yes', 'no', '')),
    atrial_fibrillation_anticoagulated VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (atrial_fibrillation_anticoagulated IN ('yes', 'no', '')),
    hyperlipidaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hyperlipidaemia IN ('yes', 'no', '')),
    previous_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_stroke IN ('yes', 'no', '')),
    previous_stroke_details TEXT NOT NULL DEFAULT '',
    previous_tia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_tia IN ('yes', 'no', '')),
    carotid_stenosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carotid_stenosis IN ('yes', 'no', '')),
    coronary_artery_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coronary_artery_disease IN ('yes', 'no', '')),
    heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heart_failure IN ('yes', 'no', '')),
    valvular_heart_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (valvular_heart_disease IN ('yes', 'no', '')),
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'former', 'never', '')),
    alcohol_excess VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alcohol_excess IN ('yes', 'no', '')),
    illicit_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (illicit_drug_use IN ('yes', 'no', '')),
    family_history_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_stroke IN ('yes', 'no', '')),
    obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obstructive_sleep_apnoea IN ('yes', 'no', '')),
    oral_contraceptive_hrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_contraceptive_hrt IN ('yes', 'no', '')),
    additional_risk_factors TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_factors_updated_at
    BEFORE UPDATE ON assessment_risk_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_factors IS
    'Risk factors section: modifiable and non-modifiable stroke risk factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risk_factors.hypertension IS
    'Whether patient has hypertension (most significant modifiable risk factor).';
COMMENT ON COLUMN assessment_risk_factors.diabetes IS
    'Whether patient has diabetes mellitus.';
COMMENT ON COLUMN assessment_risk_factors.atrial_fibrillation IS
    'Whether patient has atrial fibrillation (major cardioembolic risk factor).';
COMMENT ON COLUMN assessment_risk_factors.atrial_fibrillation_anticoagulated IS
    'Whether patient with AF is currently anticoagulated.';
COMMENT ON COLUMN assessment_risk_factors.hyperlipidaemia IS
    'Whether patient has hyperlipidaemia.';
COMMENT ON COLUMN assessment_risk_factors.previous_stroke IS
    'Whether patient has had a previous stroke.';
COMMENT ON COLUMN assessment_risk_factors.previous_stroke_details IS
    'Details of previous stroke(s) including type, date, and residual deficits.';
COMMENT ON COLUMN assessment_risk_factors.previous_tia IS
    'Whether patient has had a previous transient ischaemic attack (TIA).';
COMMENT ON COLUMN assessment_risk_factors.carotid_stenosis IS
    'Whether patient has known carotid stenosis.';
COMMENT ON COLUMN assessment_risk_factors.coronary_artery_disease IS
    'Whether patient has coronary artery disease.';
COMMENT ON COLUMN assessment_risk_factors.heart_failure IS
    'Whether patient has heart failure.';
COMMENT ON COLUMN assessment_risk_factors.valvular_heart_disease IS
    'Whether patient has valvular heart disease.';
COMMENT ON COLUMN assessment_risk_factors.smoking_status IS
    'Smoking status: current, former, never, or empty string.';
COMMENT ON COLUMN assessment_risk_factors.alcohol_excess IS
    'Whether patient consumes excess alcohol.';
COMMENT ON COLUMN assessment_risk_factors.illicit_drug_use IS
    'Whether patient uses illicit drugs (e.g. cocaine, amphetamines).';
COMMENT ON COLUMN assessment_risk_factors.family_history_stroke IS
    'Whether there is a family history of stroke.';
COMMENT ON COLUMN assessment_risk_factors.obstructive_sleep_apnoea IS
    'Whether patient has obstructive sleep apnoea.';
COMMENT ON COLUMN assessment_risk_factors.oral_contraceptive_hrt IS
    'Whether patient uses oral contraceptives or hormone replacement therapy.';
COMMENT ON COLUMN assessment_risk_factors.additional_risk_factors IS
    'Free-text additional risk factors.';

-- 08_assessment_thromboembolism_risk.sql
-- Thromboembolism risk section of the birth control assessment.

CREATE TABLE assessment_thromboembolism_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_dvt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_dvt IN ('yes', 'no', '')),
    dvt_details TEXT NOT NULL DEFAULT '',
    previous_pe VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_pe IN ('yes', 'no', '')),
    pe_details TEXT NOT NULL DEFAULT '',
    known_thrombophilia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_thrombophilia IN ('yes', 'no', '')),
    thrombophilia_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (thrombophilia_type IN ('factor-v-leiden', 'prothrombin-mutation', 'protein-c-deficiency', 'protein-s-deficiency', 'antithrombin-deficiency', 'antiphospholipid', 'other', '')),
    immobility_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immobility_risk IN ('yes', 'no', '')),
    immobility_details TEXT NOT NULL DEFAULT '',
    recent_major_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_major_surgery IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    long_haul_travel VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_haul_travel IN ('yes', 'no', '')),
    varicose_veins VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (varicose_veins IN ('yes', 'no', '')),
    thromboembolism_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_thromboembolism_risk_updated_at
    BEFORE UPDATE ON assessment_thromboembolism_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_thromboembolism_risk IS
    'Thromboembolism risk section: DVT, PE, thrombophilia, immobility, and surgery. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_thromboembolism_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_thromboembolism_risk.previous_dvt IS
    'Whether the patient has had a previous DVT (UK MEC 4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.dvt_details IS
    'Details of previous DVT including date and treatment.';
COMMENT ON COLUMN assessment_thromboembolism_risk.previous_pe IS
    'Whether the patient has had a previous PE (UK MEC 4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.pe_details IS
    'Details of previous PE including date and treatment.';
COMMENT ON COLUMN assessment_thromboembolism_risk.known_thrombophilia IS
    'Whether the patient has a known thrombophilia: yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.thrombophilia_type IS
    'Type of thrombophilia: factor-v-leiden, prothrombin-mutation, protein-c-deficiency, protein-s-deficiency, antithrombin-deficiency, antiphospholipid, other, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.immobility_risk IS
    'Whether the patient has immobility risk factors: yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.immobility_details IS
    'Details of immobility risk factors.';
COMMENT ON COLUMN assessment_thromboembolism_risk.recent_major_surgery IS
    'Whether the patient has had or is planning major surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.surgery_details IS
    'Details of recent or planned surgery.';
COMMENT ON COLUMN assessment_thromboembolism_risk.long_haul_travel IS
    'Whether the patient frequently undertakes long-haul travel (>4 hours): yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.varicose_veins IS
    'Whether the patient has varicose veins: yes, no, or empty.';
COMMENT ON COLUMN assessment_thromboembolism_risk.thromboembolism_notes IS
    'Additional clinician notes on thromboembolism risk.';

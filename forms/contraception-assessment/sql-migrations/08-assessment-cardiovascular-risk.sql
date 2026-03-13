-- 08_assessment_cardiovascular_risk.sql
-- Cardiovascular risk section of the contraception assessment.

CREATE TABLE assessment_cardiovascular_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'ex-smoker', 'never', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    age_over_35_and_smoking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (age_over_35_and_smoking IN ('yes', 'no', '')),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
    bmi_over_35 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bmi_over_35 IN ('yes', 'no', '')),
    family_history_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_vte IN ('yes', 'no', '')),
    family_vte_details TEXT NOT NULL DEFAULT '',
    family_history_arterial_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_arterial_disease IN ('yes', 'no', '')),
    family_arterial_details TEXT NOT NULL DEFAULT '',
    known_thrombophilia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_thrombophilia IN ('yes', 'no', '')),
    thrombophilia_type VARCHAR(100) NOT NULL DEFAULT '',
    immobility_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immobility_risk IN ('yes', 'no', '')),
    immobility_details TEXT NOT NULL DEFAULT '',
    major_surgery_planned VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (major_surgery_planned IN ('yes', 'no', '')),
    cardiovascular_risk_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_risk_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_risk IS
    'Cardiovascular risk section: smoking, BMI, family history, thrombophilia, immobility. Critical for UKMEC category determination. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_risk.smoking_status IS
    'Smoking status: current, ex-smoker, never, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.cigarettes_per_day IS
    'Number of cigarettes smoked per day if current smoker.';
COMMENT ON COLUMN assessment_cardiovascular_risk.age_over_35_and_smoking IS
    'Whether the patient is over 35 and a current smoker (UKMEC 3/4 for CHC): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.bmi IS
    'Body mass index.';
COMMENT ON COLUMN assessment_cardiovascular_risk.bmi_over_35 IS
    'Whether BMI is over 35 (UKMEC 3 for CHC): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_vte IS
    'Whether there is a first-degree relative with VTE: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_vte_details IS
    'Details of family VTE history.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_arterial_disease IS
    'Whether there is a first-degree relative with premature arterial disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_arterial_details IS
    'Details of family arterial disease history.';
COMMENT ON COLUMN assessment_cardiovascular_risk.known_thrombophilia IS
    'Whether the patient has a known thrombophilia: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.thrombophilia_type IS
    'Type of thrombophilia (e.g. Factor V Leiden, Protein C deficiency).';
COMMENT ON COLUMN assessment_cardiovascular_risk.immobility_risk IS
    'Whether the patient has prolonged immobility: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.immobility_details IS
    'Details of immobility (e.g. wheelchair user, long-haul travel).';
COMMENT ON COLUMN assessment_cardiovascular_risk.major_surgery_planned IS
    'Whether major surgery with prolonged immobilisation is planned: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.cardiovascular_risk_notes IS
    'Additional clinician notes on cardiovascular risk assessment.';

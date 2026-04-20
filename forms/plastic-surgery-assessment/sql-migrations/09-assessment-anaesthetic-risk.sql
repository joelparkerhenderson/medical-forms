-- 09_assessment_anaesthetic_risk.sql
-- Anaesthetic risk assessment section of the plastic surgery assessment.

CREATE TABLE assessment_anaesthetic_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    asa_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asa_class IN ('I', 'II', 'III', 'IV', 'V', '')),
    previous_anaesthetic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_anaesthetic IN ('yes', 'no', '')),
    anaesthetic_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaesthetic_complications IN ('yes', 'no', '')),
    anaesthetic_complications_details TEXT NOT NULL DEFAULT '',
    difficult_airway VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficult_airway IN ('yes', 'no', '')),
    difficult_airway_details TEXT NOT NULL DEFAULT '',
    malignant_hyperthermia_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (malignant_hyperthermia_risk IN ('yes', 'no', '')),
    family_anaesthetic_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_anaesthetic_problems IN ('yes', 'no', '')),
    family_anaesthetic_details TEXT NOT NULL DEFAULT '',
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'ex-smoker', 'never', '')),
    pack_years NUMERIC(5,1),
    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'within-guidelines', 'above-guidelines', '')),
    recreational_drugs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drugs IN ('yes', 'no', '')),
    recreational_drugs_details TEXT NOT NULL DEFAULT '',
    obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obstructive_sleep_apnoea IN ('yes', 'no', '')),
    anaesthetic_preference VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anaesthetic_preference IN ('local', 'regional', 'general', 'sedation', 'no-preference', '')),
    anaesthetic_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anaesthetic_risk_updated_at
    BEFORE UPDATE ON assessment_anaesthetic_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaesthetic_risk IS
    'Anaesthetic risk assessment section: ASA classification, previous anaesthetic history, airway, smoking, substance use. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_anaesthetic_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_anaesthetic_risk.asa_class IS
    'ASA Physical Status Classification: I, II, III, IV, V, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.anaesthetic_complications IS
    'Whether the patient has had previous anaesthetic complications: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.difficult_airway IS
    'Whether the patient has a known or predicted difficult airway: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.malignant_hyperthermia_risk IS
    'Whether the patient or family has malignant hyperthermia risk: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.smoking_status IS
    'Smoking status: current, ex-smoker, never, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.alcohol_consumption IS
    'Alcohol consumption: none, within-guidelines, above-guidelines, or empty.';
COMMENT ON COLUMN assessment_anaesthetic_risk.anaesthetic_preference IS
    'Patient preference for anaesthetic type: local, regional, general, sedation, no-preference, or empty.';

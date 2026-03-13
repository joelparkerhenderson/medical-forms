-- 09_assessment_comorbidities.sql
-- Comorbidities section of the pulmonology assessment.

CREATE TABLE assessment_comorbidities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_disease IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type-1', 'type-2', '')),
    osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (osteoporosis IN ('yes', 'no', '')),
    anxiety_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_depression IN ('yes', 'no', '')),
    gastro_oesophageal_reflux VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastro_oesophageal_reflux IN ('yes', 'no', '')),
    obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obstructive_sleep_apnoea IN ('yes', 'no', '')),
    lung_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lung_cancer IN ('yes', 'no', '')),
    pulmonary_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pulmonary_hypertension IN ('yes', 'no', '')),
    bronchiectasis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bronchiectasis IN ('yes', 'no', '')),
    interstitial_lung_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interstitial_lung_disease IN ('yes', 'no', '')),
    renal_impairment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (renal_impairment IN ('yes', 'no', '')),
    anaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaemia IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbidities_updated_at
    BEFORE UPDATE ON assessment_comorbidities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbidities IS
    'Comorbidities section: cardiovascular, metabolic, psychiatric, and other respiratory conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbidities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comorbidities.cardiovascular_disease IS
    'Whether the patient has cardiovascular disease (IHD, heart failure, arrhythmia).';
COMMENT ON COLUMN assessment_comorbidities.hypertension IS
    'Whether the patient has hypertension.';
COMMENT ON COLUMN assessment_comorbidities.diabetes IS
    'Whether the patient has diabetes mellitus.';
COMMENT ON COLUMN assessment_comorbidities.osteoporosis IS
    'Whether the patient has osteoporosis (relevant for long-term corticosteroid use).';
COMMENT ON COLUMN assessment_comorbidities.anxiety_depression IS
    'Whether the patient has anxiety or depression.';
COMMENT ON COLUMN assessment_comorbidities.gastro_oesophageal_reflux IS
    'Whether the patient has gastro-oesophageal reflux disease (GORD).';
COMMENT ON COLUMN assessment_comorbidities.obstructive_sleep_apnoea IS
    'Whether the patient has obstructive sleep apnoea (OSA).';
COMMENT ON COLUMN assessment_comorbidities.lung_cancer IS
    'Whether the patient has or has had lung cancer.';
COMMENT ON COLUMN assessment_comorbidities.pulmonary_hypertension IS
    'Whether the patient has pulmonary hypertension.';
COMMENT ON COLUMN assessment_comorbidities.bronchiectasis IS
    'Whether the patient has bronchiectasis.';
COMMENT ON COLUMN assessment_comorbidities.interstitial_lung_disease IS
    'Whether the patient has interstitial lung disease.';

-- 06_assessment_respiratory_history.sql
-- Respiratory history section of the respirology assessment.

CREATE TABLE assessment_respiratory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    asthma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asthma IN ('yes', 'no', '')),
    asthma_age_of_onset INTEGER
        CHECK (asthma_age_of_onset IS NULL OR (asthma_age_of_onset >= 0 AND asthma_age_of_onset <= 120)),
    copd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (copd IN ('yes', 'no', '')),
    copd_diagnosis_year INTEGER
        CHECK (copd_diagnosis_year IS NULL OR (copd_diagnosis_year >= 1900 AND copd_diagnosis_year <= 2100)),
    bronchiectasis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bronchiectasis IN ('yes', 'no', '')),
    interstitial_lung_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interstitial_lung_disease IN ('yes', 'no', '')),
    ild_type TEXT NOT NULL DEFAULT '',
    tuberculosis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tuberculosis_history IN ('yes', 'no', '')),
    tb_treatment_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tb_treatment_completed IN ('yes', 'no', '')),
    pneumothorax_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pneumothorax_history IN ('yes', 'no', '')),
    pulmonary_embolism VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pulmonary_embolism IN ('yes', 'no', '')),
    lung_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lung_surgery IN ('yes', 'no', '')),
    lung_surgery_details TEXT NOT NULL DEFAULT '',
    chest_trauma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_trauma IN ('yes', 'no', '')),
    previous_hospitalisations INTEGER
        CHECK (previous_hospitalisations IS NULL OR previous_hospitalisations >= 0),
    previous_intubation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_intubation IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_respiratory_history_updated_at
    BEFORE UPDATE ON assessment_respiratory_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_respiratory_history IS
    'Respiratory history section: prior respiratory diagnoses, hospitalisations, surgical history, and TB status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_respiratory_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_respiratory_history.asthma IS
    'Whether the patient has a diagnosis of asthma.';
COMMENT ON COLUMN assessment_respiratory_history.asthma_age_of_onset IS
    'Age at which asthma was diagnosed.';
COMMENT ON COLUMN assessment_respiratory_history.copd IS
    'Whether the patient has a diagnosis of COPD.';
COMMENT ON COLUMN assessment_respiratory_history.bronchiectasis IS
    'Whether the patient has bronchiectasis.';
COMMENT ON COLUMN assessment_respiratory_history.interstitial_lung_disease IS
    'Whether the patient has interstitial lung disease (ILD).';
COMMENT ON COLUMN assessment_respiratory_history.tuberculosis_history IS
    'Whether the patient has a history of tuberculosis (TB).';
COMMENT ON COLUMN assessment_respiratory_history.pneumothorax_history IS
    'Whether the patient has had a pneumothorax.';
COMMENT ON COLUMN assessment_respiratory_history.pulmonary_embolism IS
    'Whether the patient has had a pulmonary embolism.';
COMMENT ON COLUMN assessment_respiratory_history.lung_surgery IS
    'Whether the patient has had lung surgery (lobectomy, pneumonectomy, etc.).';
COMMENT ON COLUMN assessment_respiratory_history.previous_intubation IS
    'Whether the patient has been previously intubated for respiratory failure.';

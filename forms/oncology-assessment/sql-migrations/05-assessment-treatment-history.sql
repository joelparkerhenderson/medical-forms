-- 05_assessment_treatment_history.sql
-- Treatment history section of the oncology assessment.

CREATE TABLE assessment_treatment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_prior_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_surgery IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    has_prior_radiation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_radiation IN ('yes', 'no', '')),
    radiation_details TEXT NOT NULL DEFAULT '',
    has_prior_chemotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_chemotherapy IN ('yes', 'no', '')),
    chemotherapy_details TEXT NOT NULL DEFAULT '',
    has_prior_immunotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_immunotherapy IN ('yes', 'no', '')),
    immunotherapy_details TEXT NOT NULL DEFAULT '',
    has_prior_hormone_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_hormone_therapy IN ('yes', 'no', '')),
    hormone_therapy_details TEXT NOT NULL DEFAULT '',
    has_prior_targeted_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_targeted_therapy IN ('yes', 'no', '')),
    targeted_therapy_details TEXT NOT NULL DEFAULT '',
    has_clinical_trial_participation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_clinical_trial_participation IN ('yes', 'no', '')),
    clinical_trial_details TEXT NOT NULL DEFAULT '',
    best_response VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (best_response IN ('complete-response', 'partial-response', 'stable-disease', 'progressive-disease', 'not-evaluated', '')),
    treatment_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_history_updated_at
    BEFORE UPDATE ON assessment_treatment_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_history IS
    'Treatment history section: prior surgery, radiation, chemotherapy, immunotherapy, and other cancer treatments. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_history.has_prior_surgery IS
    'Whether the patient has had prior cancer surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.surgery_details IS
    'Details of prior surgical procedures including dates and outcomes.';
COMMENT ON COLUMN assessment_treatment_history.has_prior_radiation IS
    'Whether the patient has had prior radiation therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.radiation_details IS
    'Details of prior radiation therapy including site, dose, and fractions.';
COMMENT ON COLUMN assessment_treatment_history.has_prior_chemotherapy IS
    'Whether the patient has had prior chemotherapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.chemotherapy_details IS
    'Details of prior chemotherapy regimens, cycles, and outcomes.';
COMMENT ON COLUMN assessment_treatment_history.has_prior_immunotherapy IS
    'Whether the patient has had prior immunotherapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.immunotherapy_details IS
    'Details of prior immunotherapy agents and responses.';
COMMENT ON COLUMN assessment_treatment_history.has_prior_hormone_therapy IS
    'Whether the patient has had prior hormone therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.hormone_therapy_details IS
    'Details of prior hormone therapy agents and duration.';
COMMENT ON COLUMN assessment_treatment_history.has_prior_targeted_therapy IS
    'Whether the patient has had prior targeted therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.targeted_therapy_details IS
    'Details of prior targeted therapy agents and responses.';
COMMENT ON COLUMN assessment_treatment_history.has_clinical_trial_participation IS
    'Whether the patient has participated in clinical trials: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_history.clinical_trial_details IS
    'Details of clinical trial participation.';
COMMENT ON COLUMN assessment_treatment_history.best_response IS
    'Best response to prior treatment: complete-response, partial-response, stable-disease, progressive-disease, not-evaluated, or empty.';
COMMENT ON COLUMN assessment_treatment_history.treatment_history_notes IS
    'Additional notes on treatment history.';

-- 05_assessment_hearing_history.sql
-- Hearing history section of the audiology assessment.

CREATE TABLE assessment_hearing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_hearing_test VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_hearing_test IN ('yes', 'no', '')),
    previous_test_date DATE,
    previous_test_results TEXT NOT NULL DEFAULT '',
    noise_exposure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (noise_exposure_history IN ('yes', 'no', '')),
    noise_exposure_details TEXT NOT NULL DEFAULT '',
    occupational_noise_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_noise_exposure IN ('yes', 'no', '')),
    recreational_noise_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_noise_exposure IN ('yes', 'no', '')),
    uses_hearing_protection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_hearing_protection IN ('yes', 'no', '')),
    military_service VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (military_service IN ('yes', 'no', '')),
    ear_infections_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ear_infections_history IN ('yes', 'no', '')),
    ear_surgery_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ear_surgery_history IN ('yes', 'no', '')),
    ear_surgery_details TEXT NOT NULL DEFAULT '',
    ototoxic_medication_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ototoxic_medication_exposure IN ('yes', 'no', '')),
    ototoxic_medication_details TEXT NOT NULL DEFAULT '',
    family_history_hearing_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_hearing_loss IN ('yes', 'no', '')),
    family_hearing_loss_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_hearing_history_updated_at
    BEFORE UPDATE ON assessment_hearing_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hearing_history IS
    'Hearing history section: previous tests, noise exposure, ear conditions, ototoxic medications, and family history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_hearing_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_hearing_history.previous_hearing_test IS
    'Whether the patient has had a previous hearing test.';
COMMENT ON COLUMN assessment_hearing_history.previous_test_date IS
    'Date of the most recent previous hearing test, NULL if unanswered.';
COMMENT ON COLUMN assessment_hearing_history.previous_test_results IS
    'Summary of previous hearing test results.';
COMMENT ON COLUMN assessment_hearing_history.noise_exposure_history IS
    'Whether the patient has a history of noise exposure.';
COMMENT ON COLUMN assessment_hearing_history.noise_exposure_details IS
    'Details of noise exposure (type, duration, intensity).';
COMMENT ON COLUMN assessment_hearing_history.occupational_noise_exposure IS
    'Whether there has been occupational noise exposure.';
COMMENT ON COLUMN assessment_hearing_history.recreational_noise_exposure IS
    'Whether there has been recreational noise exposure (e.g. concerts, firearms, power tools).';
COMMENT ON COLUMN assessment_hearing_history.uses_hearing_protection IS
    'Whether the patient uses hearing protection in noisy environments.';
COMMENT ON COLUMN assessment_hearing_history.military_service IS
    'Whether the patient has military service history (associated with noise-induced hearing loss).';
COMMENT ON COLUMN assessment_hearing_history.ear_infections_history IS
    'Whether the patient has a history of ear infections.';
COMMENT ON COLUMN assessment_hearing_history.ear_surgery_history IS
    'Whether the patient has had ear surgery.';
COMMENT ON COLUMN assessment_hearing_history.ear_surgery_details IS
    'Details of ear surgery.';
COMMENT ON COLUMN assessment_hearing_history.ototoxic_medication_exposure IS
    'Whether the patient has been exposed to ototoxic medications (e.g. aminoglycosides, cisplatin).';
COMMENT ON COLUMN assessment_hearing_history.ototoxic_medication_details IS
    'Details of ototoxic medication exposure.';
COMMENT ON COLUMN assessment_hearing_history.family_history_hearing_loss IS
    'Whether there is a family history of hearing loss.';
COMMENT ON COLUMN assessment_hearing_history.family_hearing_loss_details IS
    'Details of family hearing loss history.';

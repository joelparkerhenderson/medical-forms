-- 04_assessment_hearing_history.sql
-- Hearing history section of the hearing aid assessment.

CREATE TABLE assessment_hearing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    onset_of_hearing_loss VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_of_hearing_loss IN ('sudden', 'gradual', 'congenital', '')),
    duration_of_hearing_loss VARCHAR(50) NOT NULL DEFAULT '',
    hearing_loss_laterality VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (hearing_loss_laterality IN ('left', 'right', 'bilateral', '')),
    worse_ear VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (worse_ear IN ('left', 'right', 'equal', '')),
    noise_exposure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (noise_exposure_history IN ('yes', 'no', '')),
    noise_exposure_details TEXT NOT NULL DEFAULT '',
    ototoxic_medication_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ototoxic_medication_history IN ('yes', 'no', '')),
    ototoxic_medication_details TEXT NOT NULL DEFAULT '',
    family_history_hearing_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_hearing_loss IN ('yes', 'no', '')),
    family_hearing_loss_details TEXT NOT NULL DEFAULT '',
    tinnitus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tinnitus IN ('yes', 'no', '')),
    tinnitus_laterality VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (tinnitus_laterality IN ('left', 'right', 'bilateral', '')),
    tinnitus_severity INTEGER
        CHECK (tinnitus_severity IS NULL OR (tinnitus_severity >= 1 AND tinnitus_severity <= 10)),
    vertigo_dizziness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vertigo_dizziness IN ('yes', 'no', '')),
    vertigo_details TEXT NOT NULL DEFAULT '',
    ear_surgery_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ear_surgery_history IN ('yes', 'no', '')),
    ear_surgery_details TEXT NOT NULL DEFAULT '',
    hearing_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_hearing_history_updated_at
    BEFORE UPDATE ON assessment_hearing_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hearing_history IS
    'Hearing history section: onset, laterality, noise exposure, tinnitus, vertigo, and ear surgery. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_hearing_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_hearing_history.onset_of_hearing_loss IS
    'Onset type: sudden, gradual, congenital, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.duration_of_hearing_loss IS
    'Duration of hearing loss (e.g. 5 years, since childhood).';
COMMENT ON COLUMN assessment_hearing_history.hearing_loss_laterality IS
    'Affected side: left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.worse_ear IS
    'Which ear is worse: left, right, equal, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.noise_exposure_history IS
    'Whether there is a history of noise exposure: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.noise_exposure_details IS
    'Details of noise exposure (occupational, recreational).';
COMMENT ON COLUMN assessment_hearing_history.ototoxic_medication_history IS
    'Whether ototoxic medications have been used: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.ototoxic_medication_details IS
    'Details of ototoxic medication use.';
COMMENT ON COLUMN assessment_hearing_history.family_history_hearing_loss IS
    'Whether there is a family history of hearing loss: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.family_hearing_loss_details IS
    'Details of family hearing loss.';
COMMENT ON COLUMN assessment_hearing_history.tinnitus IS
    'Whether tinnitus is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.tinnitus_laterality IS
    'Tinnitus side: left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.tinnitus_severity IS
    'Tinnitus severity from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_hearing_history.vertigo_dizziness IS
    'Whether vertigo or dizziness is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.vertigo_details IS
    'Details of vertigo or dizziness episodes.';
COMMENT ON COLUMN assessment_hearing_history.ear_surgery_history IS
    'Whether there is a history of ear surgery: yes, no, or empty string.';
COMMENT ON COLUMN assessment_hearing_history.ear_surgery_details IS
    'Details of ear surgery.';
COMMENT ON COLUMN assessment_hearing_history.hearing_history_notes IS
    'Free-text notes on hearing history.';

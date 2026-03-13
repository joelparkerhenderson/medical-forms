-- 09_assessment_audiogram_results.sql
-- Audiogram results section of the hearing aid assessment.

CREATE TABLE assessment_audiogram_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    audiogram_date DATE,
    -- Pure tone average (PTA) in dB HL for each ear
    left_pta_db INTEGER
        CHECK (left_pta_db IS NULL OR (left_pta_db >= -10 AND left_pta_db <= 120)),
    right_pta_db INTEGER
        CHECK (right_pta_db IS NULL OR (right_pta_db >= -10 AND right_pta_db <= 120)),
    left_hearing_loss_degree VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_hearing_loss_degree IN ('normal', 'mild', 'moderate', 'moderately-severe', 'severe', 'profound', '')),
    right_hearing_loss_degree VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_hearing_loss_degree IN ('normal', 'mild', 'moderate', 'moderately-severe', 'severe', 'profound', '')),
    left_hearing_loss_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_hearing_loss_type IN ('sensorineural', 'conductive', 'mixed', '')),
    right_hearing_loss_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_hearing_loss_type IN ('sensorineural', 'conductive', 'mixed', '')),
    left_hearing_loss_configuration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_hearing_loss_configuration IN ('flat', 'sloping', 'reverse-sloping', 'cookie-bite', 'notched', '')),
    right_hearing_loss_configuration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_hearing_loss_configuration IN ('flat', 'sloping', 'reverse-sloping', 'cookie-bite', 'notched', '')),
    speech_recognition_left_pct INTEGER
        CHECK (speech_recognition_left_pct IS NULL OR (speech_recognition_left_pct >= 0 AND speech_recognition_left_pct <= 100)),
    speech_recognition_right_pct INTEGER
        CHECK (speech_recognition_right_pct IS NULL OR (speech_recognition_right_pct >= 0 AND speech_recognition_right_pct <= 100)),
    tympanometry_left VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (tympanometry_left IN ('type-a', 'type-b', 'type-c', '')),
    tympanometry_right VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (tympanometry_right IN ('type-a', 'type-b', 'type-c', '')),
    asymmetric_hearing_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asymmetric_hearing_loss IN ('yes', 'no', '')),
    audiogram_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_audiogram_results_updated_at
    BEFORE UPDATE ON assessment_audiogram_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_audiogram_results IS
    'Audiogram results section: PTA, hearing loss type, degree, configuration, speech recognition, and tympanometry. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_audiogram_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_audiogram_results.audiogram_date IS
    'Date of audiogram, NULL if not yet performed.';
COMMENT ON COLUMN assessment_audiogram_results.left_pta_db IS
    'Left ear pure tone average in dB HL (average of 500, 1000, 2000, 4000 Hz), NULL if not tested.';
COMMENT ON COLUMN assessment_audiogram_results.right_pta_db IS
    'Right ear pure tone average in dB HL, NULL if not tested.';
COMMENT ON COLUMN assessment_audiogram_results.left_hearing_loss_degree IS
    'Left ear hearing loss degree: normal, mild, moderate, moderately-severe, severe, profound, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.right_hearing_loss_degree IS
    'Right ear hearing loss degree: normal, mild, moderate, moderately-severe, severe, profound, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.left_hearing_loss_type IS
    'Left ear hearing loss type: sensorineural, conductive, mixed, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.right_hearing_loss_type IS
    'Right ear hearing loss type: sensorineural, conductive, mixed, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.left_hearing_loss_configuration IS
    'Left ear audiogram configuration: flat, sloping, reverse-sloping, cookie-bite, notched, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.right_hearing_loss_configuration IS
    'Right ear audiogram configuration: flat, sloping, reverse-sloping, cookie-bite, notched, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.speech_recognition_left_pct IS
    'Left ear speech recognition score as percentage (0-100), NULL if not tested.';
COMMENT ON COLUMN assessment_audiogram_results.speech_recognition_right_pct IS
    'Right ear speech recognition score as percentage (0-100), NULL if not tested.';
COMMENT ON COLUMN assessment_audiogram_results.tympanometry_left IS
    'Left ear tympanometry result: type-a (normal), type-b (flat), type-c (negative pressure), or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.tympanometry_right IS
    'Right ear tympanometry result: type-a, type-b, type-c, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.asymmetric_hearing_loss IS
    'Whether asymmetric hearing loss is present (requiring MRI referral): yes, no, or empty string.';
COMMENT ON COLUMN assessment_audiogram_results.audiogram_notes IS
    'Free-text notes on audiogram results.';

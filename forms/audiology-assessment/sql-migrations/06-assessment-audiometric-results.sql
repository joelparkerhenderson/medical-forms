-- 06_assessment_audiometric_results.sql
-- Audiometric results section of the audiology assessment.

CREATE TABLE assessment_audiometric_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Right ear air conduction thresholds (dB HL)
    right_ac_250hz NUMERIC(5,1),
    right_ac_500hz NUMERIC(5,1),
    right_ac_1000hz NUMERIC(5,1),
    right_ac_2000hz NUMERIC(5,1),
    right_ac_4000hz NUMERIC(5,1),
    right_ac_8000hz NUMERIC(5,1),

    -- Left ear air conduction thresholds (dB HL)
    left_ac_250hz NUMERIC(5,1),
    left_ac_500hz NUMERIC(5,1),
    left_ac_1000hz NUMERIC(5,1),
    left_ac_2000hz NUMERIC(5,1),
    left_ac_4000hz NUMERIC(5,1),
    left_ac_8000hz NUMERIC(5,1),

    -- Right ear bone conduction thresholds (dB HL)
    right_bc_500hz NUMERIC(5,1),
    right_bc_1000hz NUMERIC(5,1),
    right_bc_2000hz NUMERIC(5,1),
    right_bc_4000hz NUMERIC(5,1),

    -- Left ear bone conduction thresholds (dB HL)
    left_bc_500hz NUMERIC(5,1),
    left_bc_1000hz NUMERIC(5,1),
    left_bc_2000hz NUMERIC(5,1),
    left_bc_4000hz NUMERIC(5,1),

    -- Pure tone averages
    right_pta_db NUMERIC(5,1),
    left_pta_db NUMERIC(5,1),

    -- Hearing type classification
    right_hearing_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_hearing_type IN ('sensorineural', 'conductive', 'mixed', 'normal', '')),
    left_hearing_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_hearing_type IN ('sensorineural', 'conductive', 'mixed', 'normal', '')),

    -- Speech audiometry
    right_srt_db NUMERIC(5,1),
    left_srt_db NUMERIC(5,1),
    right_word_recognition_percent NUMERIC(5,1)
        CHECK (right_word_recognition_percent IS NULL OR (right_word_recognition_percent >= 0 AND right_word_recognition_percent <= 100)),
    left_word_recognition_percent NUMERIC(5,1)
        CHECK (left_word_recognition_percent IS NULL OR (left_word_recognition_percent >= 0 AND left_word_recognition_percent <= 100)),

    -- Tympanometry
    right_tympanogram_type VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (right_tympanogram_type IN ('A', 'As', 'Ad', 'B', 'C', '')),
    left_tympanogram_type VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (left_tympanogram_type IN ('A', 'As', 'Ad', 'B', 'C', '')),

    test_date DATE,
    audiologist_name VARCHAR(255) NOT NULL DEFAULT '',
    audiometric_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_audiometric_results_updated_at
    BEFORE UPDATE ON assessment_audiometric_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_audiometric_results IS
    'Audiometric results section: air conduction, bone conduction, speech audiometry, and tympanometry results for both ears. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_audiometric_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_250hz IS
    'Right ear air conduction threshold at 250 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_500hz IS
    'Right ear air conduction threshold at 500 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_1000hz IS
    'Right ear air conduction threshold at 1000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_2000hz IS
    'Right ear air conduction threshold at 2000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_4000hz IS
    'Right ear air conduction threshold at 4000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_ac_8000hz IS
    'Right ear air conduction threshold at 8000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_250hz IS
    'Left ear air conduction threshold at 250 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_500hz IS
    'Left ear air conduction threshold at 500 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_1000hz IS
    'Left ear air conduction threshold at 1000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_2000hz IS
    'Left ear air conduction threshold at 2000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_4000hz IS
    'Left ear air conduction threshold at 4000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_ac_8000hz IS
    'Left ear air conduction threshold at 8000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_bc_500hz IS
    'Right ear bone conduction threshold at 500 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_bc_1000hz IS
    'Right ear bone conduction threshold at 1000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_bc_2000hz IS
    'Right ear bone conduction threshold at 2000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_bc_4000hz IS
    'Right ear bone conduction threshold at 4000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_bc_500hz IS
    'Left ear bone conduction threshold at 500 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_bc_1000hz IS
    'Left ear bone conduction threshold at 1000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_bc_2000hz IS
    'Left ear bone conduction threshold at 2000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_bc_4000hz IS
    'Left ear bone conduction threshold at 4000 Hz in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_pta_db IS
    'Right ear pure tone average (average of 500, 1000, 2000, 4000 Hz) in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_pta_db IS
    'Left ear pure tone average (average of 500, 1000, 2000, 4000 Hz) in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_hearing_type IS
    'Right ear hearing loss type: sensorineural, conductive, mixed, normal, or empty string if unanswered.';
COMMENT ON COLUMN assessment_audiometric_results.left_hearing_type IS
    'Left ear hearing loss type: sensorineural, conductive, mixed, normal, or empty string if unanswered.';
COMMENT ON COLUMN assessment_audiometric_results.right_srt_db IS
    'Right ear speech reception threshold in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.left_srt_db IS
    'Left ear speech reception threshold in dB HL.';
COMMENT ON COLUMN assessment_audiometric_results.right_word_recognition_percent IS
    'Right ear word recognition score as a percentage.';
COMMENT ON COLUMN assessment_audiometric_results.left_word_recognition_percent IS
    'Left ear word recognition score as a percentage.';
COMMENT ON COLUMN assessment_audiometric_results.right_tympanogram_type IS
    'Right ear tympanogram classification: A (normal), As (stiff), Ad (flaccid), B (flat), C (negative pressure).';
COMMENT ON COLUMN assessment_audiometric_results.left_tympanogram_type IS
    'Left ear tympanogram classification: A (normal), As (stiff), Ad (flaccid), B (flat), C (negative pressure).';
COMMENT ON COLUMN assessment_audiometric_results.test_date IS
    'Date audiometric testing was performed, NULL if unanswered.';
COMMENT ON COLUMN assessment_audiometric_results.audiologist_name IS
    'Name of the audiologist who performed the testing.';
COMMENT ON COLUMN assessment_audiometric_results.audiometric_notes IS
    'Additional notes about the audiometric results.';

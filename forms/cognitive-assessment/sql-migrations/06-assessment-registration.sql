-- 06_assessment_registration.sql
-- Registration section of the cognitive assessment (MMSE items 11-13).

CREATE TABLE assessment_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Registration: repeat three words (3 points)
    word_1 VARCHAR(50) NOT NULL DEFAULT '',
    word_1_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_1_recalled IN ('correct', 'incorrect', '')),
    word_2 VARCHAR(50) NOT NULL DEFAULT '',
    word_2_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_2_recalled IN ('correct', 'incorrect', '')),
    word_3 VARCHAR(50) NOT NULL DEFAULT '',
    word_3_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_3_recalled IN ('correct', 'incorrect', '')),
    registration_score INTEGER
        CHECK (registration_score IS NULL OR (registration_score >= 0 AND registration_score <= 3)),
    number_of_trials INTEGER
        CHECK (number_of_trials IS NULL OR (number_of_trials >= 1 AND number_of_trials <= 6)),
    registration_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_registration_updated_at
    BEFORE UPDATE ON assessment_registration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_registration IS
    'Registration section (MMSE items 11-13): immediate recall of three words (3 points). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_registration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_registration.word_1 IS
    'First word presented for registration (e.g. apple).';
COMMENT ON COLUMN assessment_registration.word_1_recalled IS
    'Whether the patient correctly repeated word 1: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_registration.word_2 IS
    'Second word presented for registration (e.g. table).';
COMMENT ON COLUMN assessment_registration.word_2_recalled IS
    'Whether the patient correctly repeated word 2: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_registration.word_3 IS
    'Third word presented for registration (e.g. penny).';
COMMENT ON COLUMN assessment_registration.word_3_recalled IS
    'Whether the patient correctly repeated word 3: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_registration.registration_score IS
    'Subtotal score for registration, 0-3.';
COMMENT ON COLUMN assessment_registration.number_of_trials IS
    'Number of trials needed to learn the three words.';
COMMENT ON COLUMN assessment_registration.registration_notes IS
    'Additional clinician notes on registration.';

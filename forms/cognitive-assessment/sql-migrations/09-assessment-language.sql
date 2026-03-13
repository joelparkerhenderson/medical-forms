-- 09_assessment_language.sql
-- Language section of the cognitive assessment (MMSE items 22-24).

CREATE TABLE assessment_language (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Naming: identify two objects (2 points)
    naming_object_1 VARCHAR(50) NOT NULL DEFAULT '',
    naming_object_1_correct VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (naming_object_1_correct IN ('correct', 'incorrect', '')),
    naming_object_2 VARCHAR(50) NOT NULL DEFAULT '',
    naming_object_2_correct VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (naming_object_2_correct IN ('correct', 'incorrect', '')),
    naming_score INTEGER
        CHECK (naming_score IS NULL OR (naming_score >= 0 AND naming_score <= 2)),

    -- Repetition: "no ifs, ands, or buts" (1 point)
    repetition_correct VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (repetition_correct IN ('correct', 'incorrect', '')),
    repetition_score INTEGER
        CHECK (repetition_score IS NULL OR (repetition_score >= 0 AND repetition_score <= 1)),

    language_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_language_updated_at
    BEFORE UPDATE ON assessment_language
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_language IS
    'Language section (MMSE items 22-24): naming two objects (2 points) and repetition (1 point). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_language.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_language.naming_object_1 IS
    'First object shown for naming (e.g. pencil).';
COMMENT ON COLUMN assessment_language.naming_object_1_correct IS
    'Whether the patient correctly named object 1: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_language.naming_object_2 IS
    'Second object shown for naming (e.g. watch).';
COMMENT ON COLUMN assessment_language.naming_object_2_correct IS
    'Whether the patient correctly named object 2: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_language.naming_score IS
    'Subtotal score for naming, 0-2.';
COMMENT ON COLUMN assessment_language.repetition_correct IS
    'Whether the patient correctly repeated the phrase: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_language.repetition_score IS
    'Subtotal score for repetition, 0-1.';
COMMENT ON COLUMN assessment_language.language_notes IS
    'Additional clinician notes on language assessment.';

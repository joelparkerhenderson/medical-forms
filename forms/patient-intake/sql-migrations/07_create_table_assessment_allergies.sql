CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    has_environmental_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_environmental_allergies IN ('yes', 'no', '')),
    has_latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_latex_allergy IN ('yes', 'no', '')),
    has_contrast_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_contrast_allergy IN ('yes', 'no', '')),
    has_anaesthetic_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_anaesthetic_allergy IN ('yes', 'no', '')),
    history_of_anaphylaxis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_anaphylaxis IN ('yes', 'no', '')),
    carries_epipen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carries_epipen IN ('yes', 'no', '')),
    allergies_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section header: drug, food, environmental, and other allergies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has drug allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.has_food_allergies IS
    'Whether the patient has food allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.has_environmental_allergies IS
    'Whether the patient has environmental allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.has_latex_allergy IS
    'Whether the patient has a latex allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.has_contrast_allergy IS
    'Whether the patient has a contrast dye allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.has_anaesthetic_allergy IS
    'Whether the patient has an anaesthetic allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.history_of_anaphylaxis IS
    'Whether the patient has a history of anaphylaxis: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.carries_epipen IS
    'Whether the patient carries an adrenaline auto-injector: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.allergies_notes IS
    'Additional notes on allergies.';

COMMENT ON COLUMN assessment_allergies.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_allergies.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_allergies.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_allergies.deleted_at IS
    'Timestamp when this row was deleted.';
-- Individual allergy items (one-to-many child)


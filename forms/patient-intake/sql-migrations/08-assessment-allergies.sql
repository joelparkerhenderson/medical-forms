-- 08_assessment_allergies.sql
-- Allergies section of the patient intake assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
    allergies_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
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

-- Individual allergy items (one-to-many child)
CREATE TABLE assessment_allergy_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    allergies_id UUID NOT NULL
        REFERENCES assessment_allergies(id) ON DELETE CASCADE,

    allergen VARCHAR(255) NOT NULL DEFAULT '',
    allergy_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (allergy_type IN ('drug', 'food', 'environmental', 'latex', 'contrast', 'anaesthetic', 'other', '')),
    reaction TEXT NOT NULL DEFAULT '',
    severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', '')),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergy_item_updated_at
    BEFORE UPDATE ON assessment_allergy_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergy_item IS
    'Individual allergy entry with allergen, type, reaction, and severity.';
COMMENT ON COLUMN assessment_allergy_item.allergen IS
    'Name of the allergen.';
COMMENT ON COLUMN assessment_allergy_item.allergy_type IS
    'Type of allergy: drug, food, environmental, latex, contrast, anaesthetic, other, or empty.';
COMMENT ON COLUMN assessment_allergy_item.reaction IS
    'Description of the allergic reaction.';
COMMENT ON COLUMN assessment_allergy_item.severity IS
    'Reaction severity: mild, moderate, severe, anaphylaxis, or empty.';
COMMENT ON COLUMN assessment_allergy_item.sort_order IS
    'Display order of the item within the list.';

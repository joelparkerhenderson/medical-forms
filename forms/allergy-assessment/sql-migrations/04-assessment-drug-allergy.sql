-- 04_assessment_drug_allergy.sql
-- Drug allergies section: header row and individual allergy items.

CREATE TABLE assessment_drug_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    cross_reactivity_concerns TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_drug_allergies_updated_at
    BEFORE UPDATE ON assessment_drug_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_drug_allergies IS
    'Drug allergies section header. One-to-one child of assessment.';

-- Individual drug allergy items (one-to-many child)
CREATE TABLE assessment_drug_allergy_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    drug_allergies_id UUID NOT NULL
        REFERENCES assessment_drug_allergies(id) ON DELETE CASCADE,

    allergen VARCHAR(255) NOT NULL DEFAULT '',
    reaction_type VARCHAR(255) NOT NULL DEFAULT '',
    severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', '')),
    timing VARCHAR(255) NOT NULL DEFAULT '',
    alternatives_tolerated TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_drug_allergy_item_updated_at
    BEFORE UPDATE ON assessment_drug_allergy_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_drug_allergy_item IS
    'Individual drug allergy entry with allergen, reaction type, and severity.';
COMMENT ON COLUMN assessment_drug_allergy_item.severity IS
    'Reaction severity: mild, moderate, severe, anaphylaxis, or empty string.';

-- 05_assessment_food_allergy.sql
-- Food allergies section: header row and individual allergy items.

CREATE TABLE assessment_food_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    ige_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ige_type IN ('IgE-mediated', 'non-IgE-mediated', 'mixed', 'unknown', '')),
    oral_allergy_syndrome VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_allergy_syndrome IN ('yes', 'no', '')),
    dietary_restrictions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_food_allergies_updated_at
    BEFORE UPDATE ON assessment_food_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_food_allergies IS
    'Food allergies section header including IgE classification. One-to-one child of assessment.';

-- Individual food allergy items (one-to-many child)
CREATE TABLE assessment_food_allergy_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    food_allergies_id UUID NOT NULL
        REFERENCES assessment_food_allergies(id) ON DELETE CASCADE,

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

CREATE TRIGGER trg_assessment_food_allergy_item_updated_at
    BEFORE UPDATE ON assessment_food_allergy_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_food_allergy_item IS
    'Individual food allergy entry with allergen, reaction type, and severity.';

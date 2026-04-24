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

CREATE TRIGGER trigger_assessment_food_allergy_item_updated_at
    BEFORE UPDATE ON assessment_food_allergy_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_food_allergy_item IS
    'Individual food allergy entry with allergen, reaction type, and severity.';

COMMENT ON COLUMN assessment_food_allergies.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_food_allergies.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_food_allergies.has_food_allergies IS
    'Has food allergies. One of: yes, no.';
COMMENT ON COLUMN assessment_food_allergies.ige_type IS
    'Ige type. One of: IgE-mediated, non-IgE-mediated, mixed, unknown.';
COMMENT ON COLUMN assessment_food_allergies.oral_allergy_syndrome IS
    'Oral allergy syndrome. One of: yes, no.';
COMMENT ON COLUMN assessment_food_allergies.dietary_restrictions IS
    'Dietary restrictions.';
COMMENT ON COLUMN assessment_food_allergies.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_food_allergies.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_food_allergy_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_food_allergy_item.food_allergies_id IS
    'Foreign key to the assessment_food_allergies table.';
COMMENT ON COLUMN assessment_food_allergy_item.allergen IS
    'Allergen.';
COMMENT ON COLUMN assessment_food_allergy_item.reaction_type IS
    'Reaction type.';
COMMENT ON COLUMN assessment_food_allergy_item.severity IS
    'Severity. One of: mild, moderate, severe, anaphylaxis.';
COMMENT ON COLUMN assessment_food_allergy_item.timing IS
    'Timing.';
COMMENT ON COLUMN assessment_food_allergy_item.alternatives_tolerated IS
    'Alternatives tolerated.';
COMMENT ON COLUMN assessment_food_allergy_item.sort_order IS
    'Sort order.';
COMMENT ON COLUMN assessment_food_allergy_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_food_allergy_item.updated_at IS
    'Timestamp when this row was last updated.';

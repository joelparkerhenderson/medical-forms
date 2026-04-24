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

CREATE TRIGGER trigger_assessment_allergy_item_updated_at
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

COMMENT ON COLUMN assessment_allergies.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_allergies.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_allergies.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_allergy_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_allergy_item.allergies_id IS
    'Foreign key to the assessment_allergies table.';
COMMENT ON COLUMN assessment_allergy_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_allergy_item.updated_at IS
    'Timestamp when this row was last updated.';

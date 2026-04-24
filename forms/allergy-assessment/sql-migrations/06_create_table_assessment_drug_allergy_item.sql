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

CREATE TRIGGER trigger_assessment_drug_allergy_item_updated_at
    BEFORE UPDATE ON assessment_drug_allergy_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_drug_allergy_item IS
    'Individual drug allergy entry with allergen, reaction type, and severity.';
COMMENT ON COLUMN assessment_drug_allergy_item.severity IS
    'Reaction severity: mild, moderate, severe, anaphylaxis, or empty string.';

COMMENT ON COLUMN assessment_drug_allergies.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_drug_allergies.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_drug_allergies.has_drug_allergies IS
    'Has drug allergies. One of: yes, no.';
COMMENT ON COLUMN assessment_drug_allergies.cross_reactivity_concerns IS
    'Cross reactivity concerns.';
COMMENT ON COLUMN assessment_drug_allergies.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_drug_allergies.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_drug_allergy_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_drug_allergy_item.drug_allergies_id IS
    'Foreign key to the assessment_drug_allergies table.';
COMMENT ON COLUMN assessment_drug_allergy_item.allergen IS
    'Allergen.';
COMMENT ON COLUMN assessment_drug_allergy_item.reaction_type IS
    'Reaction type.';
COMMENT ON COLUMN assessment_drug_allergy_item.timing IS
    'Timing.';
COMMENT ON COLUMN assessment_drug_allergy_item.alternatives_tolerated IS
    'Alternatives tolerated.';
COMMENT ON COLUMN assessment_drug_allergy_item.sort_order IS
    'Sort order.';
COMMENT ON COLUMN assessment_drug_allergy_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_drug_allergy_item.updated_at IS
    'Timestamp when this row was last updated.';

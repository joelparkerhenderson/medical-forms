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

CREATE TRIGGER trigger_assessment_food_allergies_updated_at
    BEFORE UPDATE ON assessment_food_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_food_allergies IS
    'Food allergies section header including IgE classification. One-to-one child of assessment.';

-- Individual food allergy items (one-to-many child)

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

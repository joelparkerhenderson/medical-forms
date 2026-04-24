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

CREATE TRIGGER trigger_assessment_drug_allergies_updated_at
    BEFORE UPDATE ON assessment_drug_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_drug_allergies IS
    'Drug allergies section header. One-to-one child of assessment.';

-- Individual drug allergy items (one-to-many child)

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

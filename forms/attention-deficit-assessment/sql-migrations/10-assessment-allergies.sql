-- 10_assessment_allergies.sql
-- Allergies section of the attention deficit assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    food_allergy_details TEXT NOT NULL DEFAULT '',
    has_other_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_other_allergies IN ('yes', 'no', '')),
    other_allergy_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section: drug, food, and other allergies relevant to ADHD medication prescribing. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has drug allergies.';
COMMENT ON COLUMN assessment_allergies.drug_allergy_details IS
    'Details of drug allergies including reactions.';
COMMENT ON COLUMN assessment_allergies.has_food_allergies IS
    'Whether the patient has food allergies.';
COMMENT ON COLUMN assessment_allergies.food_allergy_details IS
    'Details of food allergies.';
COMMENT ON COLUMN assessment_allergies.has_other_allergies IS
    'Whether the patient has other allergies.';
COMMENT ON COLUMN assessment_allergies.other_allergy_details IS
    'Details of other allergies.';

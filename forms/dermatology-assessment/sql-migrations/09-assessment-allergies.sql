-- 09_assessment_allergies.sql
-- Step 7: Allergies section of the dermatology assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    has_contact_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_contact_allergies IN ('yes', 'no', '')),
    contact_allergy_details TEXT NOT NULL DEFAULT '',
    patch_testing_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patch_testing_performed IN ('yes', 'no', '')),
    patch_testing_results TEXT NOT NULL DEFAULT '',
    has_latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_latex_allergy IN ('yes', 'no', '')),
    has_nickel_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_nickel_allergy IN ('yes', 'no', '')),
    has_fragrance_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_fragrance_allergy IN ('yes', 'no', '')),
    has_preservative_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_preservative_allergy IN ('yes', 'no', '')),
    has_cosmetic_sensitivities VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cosmetic_sensitivities IN ('yes', 'no', '')),
    cosmetic_sensitivity_details TEXT NOT NULL DEFAULT '',
    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    food_allergy_details TEXT NOT NULL DEFAULT '',
    other_allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Step 7 Allergies: drug, contact, and environmental allergies relevant to dermatology. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has known drug allergies.';
COMMENT ON COLUMN assessment_allergies.drug_allergy_details IS
    'Details of drug allergies including reaction type.';
COMMENT ON COLUMN assessment_allergies.has_contact_allergies IS
    'Whether the patient has contact allergies (type IV hypersensitivity).';
COMMENT ON COLUMN assessment_allergies.contact_allergy_details IS
    'Details of contact allergens and reactions.';
COMMENT ON COLUMN assessment_allergies.patch_testing_performed IS
    'Whether patch testing has been performed.';
COMMENT ON COLUMN assessment_allergies.patch_testing_results IS
    'Results of patch testing if performed.';
COMMENT ON COLUMN assessment_allergies.has_latex_allergy IS
    'Whether the patient has a latex allergy.';
COMMENT ON COLUMN assessment_allergies.has_nickel_allergy IS
    'Whether the patient has a nickel allergy (common contact allergen).';
COMMENT ON COLUMN assessment_allergies.has_fragrance_allergy IS
    'Whether the patient has a fragrance allergy.';
COMMENT ON COLUMN assessment_allergies.has_preservative_allergy IS
    'Whether the patient has a preservative allergy (e.g. parabens, formaldehyde).';
COMMENT ON COLUMN assessment_allergies.has_cosmetic_sensitivities IS
    'Whether the patient has sensitivities to cosmetic products.';
COMMENT ON COLUMN assessment_allergies.cosmetic_sensitivity_details IS
    'Details of cosmetic sensitivities.';
COMMENT ON COLUMN assessment_allergies.has_food_allergies IS
    'Whether the patient has food allergies that may affect skin.';
COMMENT ON COLUMN assessment_allergies.food_allergy_details IS
    'Details of food allergies.';
COMMENT ON COLUMN assessment_allergies.other_allergies IS
    'Free-text description of any other allergies.';

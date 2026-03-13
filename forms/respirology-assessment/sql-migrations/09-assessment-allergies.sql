-- 09_assessment_allergies.sql
-- Allergies section of the respirology assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    has_environmental_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_environmental_allergies IN ('yes', 'no', '')),
    environmental_allergy_details TEXT NOT NULL DEFAULT '',
    atopic_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (atopic_history IN ('yes', 'no', '')),
    eczema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (eczema IN ('yes', 'no', '')),
    allergic_rhinitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (allergic_rhinitis IN ('yes', 'no', '')),
    food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (food_allergies IN ('yes', 'no', '')),
    food_allergy_details TEXT NOT NULL DEFAULT '',
    aspirin_sensitivity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (aspirin_sensitivity IN ('yes', 'no', '')),
    allergy_testing_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (allergy_testing_performed IN ('yes', 'no', '')),
    allergy_test_results TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section: drug, environmental, and food allergies with atopic history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has drug allergies.';
COMMENT ON COLUMN assessment_allergies.has_environmental_allergies IS
    'Whether the patient has environmental allergies (dust, pollen, moulds).';
COMMENT ON COLUMN assessment_allergies.atopic_history IS
    'Whether the patient has an atopic history (eczema, allergic rhinitis, asthma).';
COMMENT ON COLUMN assessment_allergies.eczema IS
    'Whether the patient has eczema.';
COMMENT ON COLUMN assessment_allergies.allergic_rhinitis IS
    'Whether the patient has allergic rhinitis.';
COMMENT ON COLUMN assessment_allergies.aspirin_sensitivity IS
    'Whether the patient has aspirin or NSAID sensitivity.';
COMMENT ON COLUMN assessment_allergies.allergy_testing_performed IS
    'Whether formal allergy testing has been performed.';

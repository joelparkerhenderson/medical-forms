-- 09_assessment_food_allergies_intolerances.sql
-- Food allergies and intolerances section of the nutrition assessment.

CREATE TABLE assessment_food_allergies_intolerances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    has_food_intolerances VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_intolerances IN ('yes', 'no', '')),
    coeliac_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coeliac_disease IN ('yes', 'no', '')),
    lactose_intolerance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lactose_intolerance IN ('yes', 'no', '')),
    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    anaphylaxis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaphylaxis_history IN ('yes', 'no', '')),
    anaphylaxis_details TEXT NOT NULL DEFAULT '',
    epipen_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epipen_available IN ('yes', 'no', '')),
    allergy_details TEXT NOT NULL DEFAULT '',
    intolerance_details TEXT NOT NULL DEFAULT '',
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    food_allergy_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_food_allergies_intolerances_updated_at
    BEFORE UPDATE ON assessment_food_allergies_intolerances
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_food_allergies_intolerances IS
    'Food allergies and intolerances section: food allergies, intolerances, coeliac disease, and drug allergies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_food_allergies_intolerances.has_food_allergies IS
    'Whether the patient has food allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.has_food_intolerances IS
    'Whether the patient has food intolerances: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.coeliac_disease IS
    'Whether the patient has diagnosed coeliac disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.lactose_intolerance IS
    'Whether the patient has lactose intolerance: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.has_drug_allergies IS
    'Whether the patient has drug allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.anaphylaxis_history IS
    'Whether the patient has a history of anaphylaxis: yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.anaphylaxis_details IS
    'Details of anaphylaxis history if applicable.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.epipen_available IS
    'Whether the patient has an adrenaline auto-injector (EpiPen): yes, no, or empty.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.allergy_details IS
    'Details of specific food allergies and reactions.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.intolerance_details IS
    'Details of food intolerances and symptoms.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.drug_allergy_details IS
    'Details of drug allergies and reactions.';
COMMENT ON COLUMN assessment_food_allergies_intolerances.food_allergy_notes IS
    'Additional clinician notes on food allergies and intolerances.';

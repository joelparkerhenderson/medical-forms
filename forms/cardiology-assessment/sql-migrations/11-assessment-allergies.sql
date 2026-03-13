-- 11_assessment_allergies.sql
-- Allergies section of the cardiology assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    contrast_dye_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (contrast_dye_allergy IN ('yes', 'no', '')),
    contrast_dye_allergy_details TEXT NOT NULL DEFAULT '',
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    other_allergies TEXT NOT NULL DEFAULT '',
    previous_adverse_reactions TEXT NOT NULL DEFAULT '',
    allergy_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section: drug allergies, contrast dye allergy, latex allergy, and adverse reactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has any known drug allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.drug_allergy_details IS
    'Details of drug allergies including drug name and reaction.';
COMMENT ON COLUMN assessment_allergies.contrast_dye_allergy IS
    'Whether the patient has a contrast dye allergy (important for angiography): yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.contrast_dye_allergy_details IS
    'Details of contrast dye allergy reactions.';
COMMENT ON COLUMN assessment_allergies.latex_allergy IS
    'Whether the patient has a latex allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_allergies.other_allergies IS
    'Free-text list of other allergies.';
COMMENT ON COLUMN assessment_allergies.previous_adverse_reactions IS
    'Details of any previous adverse drug reactions.';
COMMENT ON COLUMN assessment_allergies.allergy_notes IS
    'Additional clinician notes on allergies.';

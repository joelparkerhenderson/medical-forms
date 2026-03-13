-- 10_assessment_allergies.sql
-- Allergies section of the rheumatology assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    methotrexate_intolerance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (methotrexate_intolerance IN ('yes', 'no', '')),
    sulfa_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sulfa_allergy IN ('yes', 'no', '')),
    nsaid_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nsaid_allergy IN ('yes', 'no', '')),
    biologic_reaction_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (biologic_reaction_history IN ('yes', 'no', '')),
    biologic_reaction_details TEXT NOT NULL DEFAULT '',
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    other_allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section: drug allergies and intolerances relevant to rheumatology treatment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether patient has any known drug allergies.';
COMMENT ON COLUMN assessment_allergies.drug_allergy_details IS
    'Details of drug allergies including reactions.';
COMMENT ON COLUMN assessment_allergies.methotrexate_intolerance IS
    'Whether patient has methotrexate intolerance (important for DMARD selection).';
COMMENT ON COLUMN assessment_allergies.sulfa_allergy IS
    'Whether patient has sulfa allergy (relevant for sulfasalazine use).';
COMMENT ON COLUMN assessment_allergies.nsaid_allergy IS
    'Whether patient has NSAID allergy.';
COMMENT ON COLUMN assessment_allergies.biologic_reaction_history IS
    'Whether patient has had a reaction to a biologic agent.';
COMMENT ON COLUMN assessment_allergies.biologic_reaction_details IS
    'Details of biologic agent reactions.';
COMMENT ON COLUMN assessment_allergies.latex_allergy IS
    'Whether patient has a latex allergy.';
COMMENT ON COLUMN assessment_allergies.other_allergies IS
    'Free-text description of other allergies.';

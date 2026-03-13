-- 08_assessment_allergies.sql
-- Allergies section of the asthma assessment.

CREATE TABLE assessment_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_atopic_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_atopic_history IN ('yes', 'no', '')),
    has_eczema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_eczema IN ('yes', 'no', '')),
    has_allergic_rhinitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_allergic_rhinitis IN ('yes', 'no', '')),
    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    food_allergy_details TEXT NOT NULL DEFAULT '',
    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    has_anaphylaxis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_anaphylaxis_history IN ('yes', 'no', '')),
    anaphylaxis_details TEXT NOT NULL DEFAULT '',
    allergy_testing_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (allergy_testing_done IN ('yes', 'no', '')),
    allergy_testing_results TEXT NOT NULL DEFAULT '',
    total_ige_level NUMERIC(8,2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_updated_at
    BEFORE UPDATE ON assessment_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies IS
    'Allergies section: atopic history, specific allergies, and allergy testing. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies.has_atopic_history IS
    'Whether the patient has a personal history of atopy (asthma, eczema, hay fever).';
COMMENT ON COLUMN assessment_allergies.has_eczema IS
    'Whether the patient has eczema or atopic dermatitis.';
COMMENT ON COLUMN assessment_allergies.has_allergic_rhinitis IS
    'Whether the patient has allergic rhinitis or hay fever.';
COMMENT ON COLUMN assessment_allergies.has_food_allergies IS
    'Whether the patient has food allergies.';
COMMENT ON COLUMN assessment_allergies.food_allergy_details IS
    'Details of food allergies.';
COMMENT ON COLUMN assessment_allergies.has_drug_allergies IS
    'Whether the patient has drug allergies.';
COMMENT ON COLUMN assessment_allergies.drug_allergy_details IS
    'Details of drug allergies.';
COMMENT ON COLUMN assessment_allergies.has_anaphylaxis_history IS
    'Whether the patient has a history of anaphylaxis.';
COMMENT ON COLUMN assessment_allergies.anaphylaxis_details IS
    'Details of anaphylaxis episodes.';
COMMENT ON COLUMN assessment_allergies.allergy_testing_done IS
    'Whether allergy testing (skin prick or specific IgE) has been performed.';
COMMENT ON COLUMN assessment_allergies.allergy_testing_results IS
    'Results of allergy testing.';
COMMENT ON COLUMN assessment_allergies.total_ige_level IS
    'Total IgE level in kU/L, NULL if not tested.';

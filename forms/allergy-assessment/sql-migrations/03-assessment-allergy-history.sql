-- 03_assessment_allergy_history.sql
-- Allergy history section of the assessment.

CREATE TABLE assessment_allergy_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age_of_onset INTEGER
        CHECK (age_of_onset IS NULL OR (age_of_onset >= 0 AND age_of_onset <= 120)),
    known_allergens TEXT NOT NULL DEFAULT '',
    family_history_of_atopy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_atopy IN ('yes', 'no', '')),
    family_atopy_details TEXT NOT NULL DEFAULT '',
    family_history_of_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_allergy IN ('yes', 'no', '')),
    family_allergy_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergy_history_updated_at
    BEFORE UPDATE ON assessment_allergy_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergy_history IS
    'Allergy history section: age of onset, known allergens, and family history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergy_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergy_history.age_of_onset IS
    'Age when allergies first presented, in years.';
COMMENT ON COLUMN assessment_allergy_history.known_allergens IS
    'Free-text list of all known allergens.';
COMMENT ON COLUMN assessment_allergy_history.family_history_of_atopy IS
    'Whether there is a family history of atopic conditions (asthma, eczema, hay fever).';
COMMENT ON COLUMN assessment_allergy_history.family_history_of_allergy IS
    'Whether there is a family history of allergy.';

-- 16-assessment-allergy.sql
-- Step 13 (allergies): confirmed allergies with reaction details.
-- Many-to-one child of assessment.

CREATE TABLE assessment_allergy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL
        REFERENCES assessment(id) ON DELETE CASCADE,

    allergen VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (category IN ('drug', 'latex', 'food', 'adhesive', 'contrast', 'environment', 'other', '')),
    reaction_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (reaction_type IN ('anaphylaxis', 'rash', 'urticaria', 'angioedema', 'gi-upset', 'bronchospasm', 'other', '')),
    reaction_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reaction_severity IN ('mild', 'moderate', 'severe', 'life-threatening', '')),
    reaction_notes VARCHAR(500) NOT NULL DEFAULT '',
    verified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (verified IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_allergy_assessment_id
    ON assessment_allergy(assessment_id);

CREATE TRIGGER trg_assessment_allergy_updated_at
    BEFORE UPDATE ON assessment_allergy
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergy IS
    'Step 13 allergies: confirmed allergies with reaction type and severity.';
COMMENT ON COLUMN assessment_allergy.assessment_id IS
    'Foreign key to the parent assessment.';
COMMENT ON COLUMN assessment_allergy.allergen IS
    'Allergen (drug name, food, latex, etc.).';
COMMENT ON COLUMN assessment_allergy.category IS
    'Category: drug, latex, food, adhesive, contrast, environment, other.';
COMMENT ON COLUMN assessment_allergy.reaction_type IS
    'Reaction type: anaphylaxis, rash, urticaria, angioedema, gi-upset, bronchospasm, other.';
COMMENT ON COLUMN assessment_allergy.reaction_severity IS
    'Severity: mild, moderate, severe, life-threatening.';
COMMENT ON COLUMN assessment_allergy.reaction_notes IS
    'Free-text description of the reaction.';
COMMENT ON COLUMN assessment_allergy.verified IS
    'Whether the allergy is clinician-verified from source.';

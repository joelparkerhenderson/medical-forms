-- 11_assessment_family_history.sql
-- Family history section of the autism assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_of_autism VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_autism IN ('yes', 'no', '')),
    family_autism_details TEXT NOT NULL DEFAULT '',
    family_history_of_adhd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_adhd IN ('yes', 'no', '')),
    family_adhd_details TEXT NOT NULL DEFAULT '',
    family_history_of_learning_disability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_learning_disability IN ('yes', 'no', '')),
    family_learning_disability_details TEXT NOT NULL DEFAULT '',
    family_history_of_mental_health VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_mental_health IN ('yes', 'no', '')),
    family_mental_health_details TEXT NOT NULL DEFAULT '',
    family_history_of_epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_epilepsy IN ('yes', 'no', '')),
    consanguinity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consanguinity IN ('yes', 'no', '')),
    family_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Family history section: neurodevelopmental conditions, mental health, and genetic factors in the family. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_history_of_autism IS
    'Whether any family member has a diagnosis of autism: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_autism_details IS
    'Details of family members with autism diagnoses including relationship.';
COMMENT ON COLUMN assessment_family_history.family_history_of_adhd IS
    'Whether any family member has a diagnosis of ADHD: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_adhd_details IS
    'Details of family members with ADHD diagnoses.';
COMMENT ON COLUMN assessment_family_history.family_history_of_learning_disability IS
    'Whether any family member has a learning disability: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_learning_disability_details IS
    'Details of family members with learning disabilities.';
COMMENT ON COLUMN assessment_family_history.family_history_of_mental_health IS
    'Whether any family member has a mental health condition: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_mental_health_details IS
    'Details of family members with mental health conditions.';
COMMENT ON COLUMN assessment_family_history.family_history_of_epilepsy IS
    'Whether any family member has epilepsy: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.consanguinity IS
    'Whether there is consanguinity (parents are blood-related): yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_notes IS
    'Additional clinician or patient notes on family history.';

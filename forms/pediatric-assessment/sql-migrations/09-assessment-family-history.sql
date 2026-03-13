-- 09_assessment_family_history.sql
-- Family history section of the pediatric assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_significant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_significant IN ('yes', 'no', '')),
    consanguinity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consanguinity IN ('yes', 'no', '')),
    genetic_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (genetic_conditions IN ('yes', 'no', '')),
    genetic_condition_details TEXT NOT NULL DEFAULT '',
    developmental_delays_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (developmental_delays_family IN ('yes', 'no', '')),
    developmental_delay_details TEXT NOT NULL DEFAULT '',
    mental_health_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mental_health_family IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',
    chronic_disease_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_disease_family IN ('yes', 'no', '')),
    chronic_disease_details TEXT NOT NULL DEFAULT '',
    sudden_infant_death VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sudden_infant_death IN ('yes', 'no', '')),
    childhood_cancer_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_cancer_family IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Family history section: genetic conditions, developmental delays, mental health, chronic disease, and consanguinity. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_history_significant IS
    'Whether there is any significant family medical history.';
COMMENT ON COLUMN assessment_family_history.consanguinity IS
    'Whether the parents are consanguineous (related by blood).';
COMMENT ON COLUMN assessment_family_history.genetic_conditions IS
    'Whether there are known genetic conditions in the family.';
COMMENT ON COLUMN assessment_family_history.genetic_condition_details IS
    'Details of family genetic conditions.';
COMMENT ON COLUMN assessment_family_history.developmental_delays_family IS
    'Whether there is a family history of developmental delays.';
COMMENT ON COLUMN assessment_family_history.mental_health_family IS
    'Whether there is a family history of mental health conditions.';
COMMENT ON COLUMN assessment_family_history.chronic_disease_family IS
    'Whether there is a family history of chronic diseases (diabetes, asthma, etc.).';
COMMENT ON COLUMN assessment_family_history.sudden_infant_death IS
    'Whether there is a family history of sudden infant death syndrome (SIDS).';
COMMENT ON COLUMN assessment_family_history.childhood_cancer_family IS
    'Whether there is a family history of childhood cancers.';

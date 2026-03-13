-- 10_assessment_comorbidities.sql
-- Comorbidities section of the asthma assessment.

CREATE TABLE assessment_comorbidities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_gord VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_gord IN ('yes', 'no', '')),
    has_obesity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_obesity IN ('yes', 'no', '')),
    has_obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_obstructive_sleep_apnoea IN ('yes', 'no', '')),
    has_nasal_polyps VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_nasal_polyps IN ('yes', 'no', '')),
    has_anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_anxiety IN ('yes', 'no', '')),
    has_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_depression IN ('yes', 'no', '')),
    has_vocal_cord_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_vocal_cord_dysfunction IN ('yes', 'no', '')),
    has_copd_overlap VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_copd_overlap IN ('yes', 'no', '')),
    has_bronchiectasis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_bronchiectasis IN ('yes', 'no', '')),
    other_comorbidities TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbidities_updated_at
    BEFORE UPDATE ON assessment_comorbidities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbidities IS
    'Comorbidities section: conditions that may affect asthma control or mimic asthma symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbidities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comorbidities.has_gord IS
    'Whether the patient has gastro-oesophageal reflux disease.';
COMMENT ON COLUMN assessment_comorbidities.has_obesity IS
    'Whether the patient has obesity (BMI >= 30).';
COMMENT ON COLUMN assessment_comorbidities.has_obstructive_sleep_apnoea IS
    'Whether the patient has obstructive sleep apnoea.';
COMMENT ON COLUMN assessment_comorbidities.has_nasal_polyps IS
    'Whether the patient has nasal polyps.';
COMMENT ON COLUMN assessment_comorbidities.has_anxiety IS
    'Whether the patient has anxiety.';
COMMENT ON COLUMN assessment_comorbidities.has_depression IS
    'Whether the patient has depression.';
COMMENT ON COLUMN assessment_comorbidities.has_vocal_cord_dysfunction IS
    'Whether the patient has vocal cord dysfunction (may mimic asthma).';
COMMENT ON COLUMN assessment_comorbidities.has_copd_overlap IS
    'Whether the patient has asthma-COPD overlap syndrome.';
COMMENT ON COLUMN assessment_comorbidities.has_bronchiectasis IS
    'Whether the patient has bronchiectasis.';
COMMENT ON COLUMN assessment_comorbidities.other_comorbidities IS
    'Free-text list of other relevant comorbidities.';

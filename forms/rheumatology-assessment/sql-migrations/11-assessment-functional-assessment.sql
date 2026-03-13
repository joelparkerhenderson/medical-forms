-- 11_assessment_functional_assessment.sql
-- Functional assessment section of the rheumatology assessment.

CREATE TABLE assessment_functional_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Health Assessment Questionnaire (HAQ) domains
    haq_dressing_grooming INTEGER
        CHECK (haq_dressing_grooming IS NULL OR (haq_dressing_grooming >= 0 AND haq_dressing_grooming <= 3)),
    haq_arising INTEGER
        CHECK (haq_arising IS NULL OR (haq_arising >= 0 AND haq_arising <= 3)),
    haq_eating INTEGER
        CHECK (haq_eating IS NULL OR (haq_eating >= 0 AND haq_eating <= 3)),
    haq_walking INTEGER
        CHECK (haq_walking IS NULL OR (haq_walking >= 0 AND haq_walking <= 3)),
    haq_hygiene INTEGER
        CHECK (haq_hygiene IS NULL OR (haq_hygiene >= 0 AND haq_hygiene <= 3)),
    haq_reach INTEGER
        CHECK (haq_reach IS NULL OR (haq_reach >= 0 AND haq_reach <= 3)),
    haq_grip INTEGER
        CHECK (haq_grip IS NULL OR (haq_grip >= 0 AND haq_grip <= 3)),
    haq_activities INTEGER
        CHECK (haq_activities IS NULL OR (haq_activities >= 0 AND haq_activities <= 3)),

    -- Work and mobility impact
    work_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (work_impact IN ('none', 'mild', 'moderate', 'severe', 'unable_to_work', '')),
    mobility_aid_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mobility_aid_use IN ('yes', 'no', '')),
    mobility_aid_details TEXT NOT NULL DEFAULT '',
    physiotherapy_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (physiotherapy_current IN ('yes', 'no', '')),
    occupational_therapy_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_therapy_current IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_assessment_updated_at
    BEFORE UPDATE ON assessment_functional_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_assessment IS
    'Functional assessment section: HAQ disability index domains and work/mobility impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_assessment.haq_dressing_grooming IS
    'HAQ dressing and grooming score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_arising IS
    'HAQ arising score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_eating IS
    'HAQ eating score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_walking IS
    'HAQ walking score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_hygiene IS
    'HAQ hygiene score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_reach IS
    'HAQ reach score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_grip IS
    'HAQ grip score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.haq_activities IS
    'HAQ activities score: 0=without difficulty, 1=with some difficulty, 2=with much difficulty, 3=unable.';
COMMENT ON COLUMN assessment_functional_assessment.work_impact IS
    'Impact on work: none, mild, moderate, severe, unable_to_work, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_assessment.mobility_aid_use IS
    'Whether patient uses mobility aids.';
COMMENT ON COLUMN assessment_functional_assessment.mobility_aid_details IS
    'Details of mobility aids used.';
COMMENT ON COLUMN assessment_functional_assessment.physiotherapy_current IS
    'Whether patient is currently receiving physiotherapy.';
COMMENT ON COLUMN assessment_functional_assessment.occupational_therapy_current IS
    'Whether patient is currently receiving occupational therapy.';

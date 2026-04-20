-- 11_assessment_previous_support.sql
-- Previous support and interventions section of the dyslexia assessment.

CREATE TABLE assessment_previous_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_assessments VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_assessments IN ('yes', 'no', '')),
    previous_assessments_details TEXT NOT NULL DEFAULT '',
    previous_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_diagnosis IN ('yes', 'no', '')),
    previous_diagnosis_details TEXT NOT NULL DEFAULT '',
    school_interventions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (school_interventions IN ('yes', 'no', '')),
    school_interventions_details TEXT NOT NULL DEFAULT '',
    speech_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (speech_therapy IN ('yes', 'no', '')),
    speech_therapy_details TEXT NOT NULL DEFAULT '',
    occupational_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_therapy IN ('yes', 'no', '')),
    occupational_therapy_details TEXT NOT NULL DEFAULT '',
    assistive_technology VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (assistive_technology IN ('yes', 'no', '')),
    assistive_technology_details TEXT NOT NULL DEFAULT '',
    exam_access_arrangements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exam_access_arrangements IN ('yes', 'no', '')),
    exam_access_details TEXT NOT NULL DEFAULT '',
    support_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_previous_support_updated_at
    BEFORE UPDATE ON assessment_previous_support
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_support IS
    'Previous support and interventions section: assessments, diagnoses, therapies, technology, exam arrangements. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_previous_support.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_previous_support.previous_assessments IS
    'Whether the patient has had previous assessments: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.previous_assessments_details IS
    'Details of previous assessments.';
COMMENT ON COLUMN assessment_previous_support.previous_diagnosis IS
    'Whether the patient has a previous diagnosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.previous_diagnosis_details IS
    'Details of previous diagnosis.';
COMMENT ON COLUMN assessment_previous_support.school_interventions IS
    'Whether school-based interventions have been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.school_interventions_details IS
    'Details of school-based interventions.';
COMMENT ON COLUMN assessment_previous_support.speech_therapy IS
    'Whether the patient has received speech and language therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.speech_therapy_details IS
    'Details of speech and language therapy.';
COMMENT ON COLUMN assessment_previous_support.occupational_therapy IS
    'Whether the patient has received occupational therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.occupational_therapy_details IS
    'Details of occupational therapy.';
COMMENT ON COLUMN assessment_previous_support.assistive_technology IS
    'Whether the patient uses assistive technology: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.assistive_technology_details IS
    'Details of assistive technology used.';
COMMENT ON COLUMN assessment_previous_support.exam_access_arrangements IS
    'Whether exam access arrangements are in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_support.exam_access_details IS
    'Details of exam access arrangements.';
COMMENT ON COLUMN assessment_previous_support.support_notes IS
    'Additional clinician notes on previous support and interventions.';

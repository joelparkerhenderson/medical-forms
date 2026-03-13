-- 10_assessment_current_support.sql
-- Current support section of the autism assessment.

CREATE TABLE assessment_current_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    receiving_mental_health_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receiving_mental_health_support IN ('yes', 'no', '')),
    mental_health_support_details TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    receiving_occupational_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receiving_occupational_therapy IN ('yes', 'no', '')),
    receiving_speech_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receiving_speech_therapy IN ('yes', 'no', '')),
    receiving_behavioural_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receiving_behavioural_support IN ('yes', 'no', '')),
    social_care_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_care_involvement IN ('yes', 'no', '')),
    social_care_details TEXT NOT NULL DEFAULT '',
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'student', 'retired', 'other', '')),
    employment_support_needs TEXT NOT NULL DEFAULT '',
    independent_living VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (independent_living IN ('fully-independent', 'some-support', 'significant-support', 'dependent', '')),
    current_support_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_support_updated_at
    BEFORE UPDATE ON assessment_current_support
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_support IS
    'Current support section: therapies, medications, social care, employment, and independent living. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_support.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_support.receiving_mental_health_support IS
    'Whether the patient currently receives mental health support: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_support.mental_health_support_details IS
    'Details of mental health support received.';
COMMENT ON COLUMN assessment_current_support.current_medications IS
    'List of current medications.';
COMMENT ON COLUMN assessment_current_support.receiving_occupational_therapy IS
    'Whether the patient receives occupational therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_support.receiving_speech_therapy IS
    'Whether the patient receives speech and language therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_support.receiving_behavioural_support IS
    'Whether the patient receives behavioural support: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_support.social_care_involvement IS
    'Whether social care services are involved: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_support.social_care_details IS
    'Details of social care involvement.';
COMMENT ON COLUMN assessment_current_support.employment_status IS
    'Current employment status: employed, unemployed, student, retired, other, or empty.';
COMMENT ON COLUMN assessment_current_support.employment_support_needs IS
    'Description of employment-related support needs.';
COMMENT ON COLUMN assessment_current_support.independent_living IS
    'Level of independent living: fully-independent, some-support, significant-support, dependent, or empty.';
COMMENT ON COLUMN assessment_current_support.current_support_notes IS
    'Additional clinician or patient notes on current support.';

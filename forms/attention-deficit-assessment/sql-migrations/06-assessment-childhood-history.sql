-- 06_assessment_childhood_history.sql
-- Childhood history section of the attention deficit assessment.

CREATE TABLE assessment_childhood_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    symptoms_present_before_age_12 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (symptoms_present_before_age_12 IN ('yes', 'no', 'unsure', '')),
    childhood_academic_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_academic_difficulties IN ('yes', 'no', '')),
    childhood_academic_details TEXT NOT NULL DEFAULT '',
    childhood_behavioural_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_behavioural_problems IN ('yes', 'no', '')),
    childhood_behavioural_details TEXT NOT NULL DEFAULT '',
    childhood_social_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_social_difficulties IN ('yes', 'no', '')),
    previous_adhd_assessment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_adhd_assessment IN ('yes', 'no', '')),
    previous_assessment_details TEXT NOT NULL DEFAULT '',
    school_reports_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (school_reports_available IN ('yes', 'no', '')),
    informant_corroboration VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (informant_corroboration IN ('yes', 'no', '')),
    informant_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_childhood_history_updated_at
    BEFORE UPDATE ON assessment_childhood_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_childhood_history IS
    'Childhood history section: evidence of ADHD symptoms before age 12, as required by DSM-5 diagnostic criteria. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_childhood_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_childhood_history.symptoms_present_before_age_12 IS
    'Whether symptoms consistent with ADHD were present before age 12 (DSM-5 criterion).';
COMMENT ON COLUMN assessment_childhood_history.childhood_academic_difficulties IS
    'Whether there were academic difficulties in childhood.';
COMMENT ON COLUMN assessment_childhood_history.childhood_academic_details IS
    'Details of childhood academic difficulties.';
COMMENT ON COLUMN assessment_childhood_history.childhood_behavioural_problems IS
    'Whether there were behavioural problems in childhood.';
COMMENT ON COLUMN assessment_childhood_history.childhood_behavioural_details IS
    'Details of childhood behavioural problems.';
COMMENT ON COLUMN assessment_childhood_history.childhood_social_difficulties IS
    'Whether there were social difficulties in childhood.';
COMMENT ON COLUMN assessment_childhood_history.previous_adhd_assessment IS
    'Whether the patient has had a previous ADHD assessment.';
COMMENT ON COLUMN assessment_childhood_history.previous_assessment_details IS
    'Details of any previous ADHD assessment or diagnosis.';
COMMENT ON COLUMN assessment_childhood_history.school_reports_available IS
    'Whether school reports are available as corroborating evidence.';
COMMENT ON COLUMN assessment_childhood_history.informant_corroboration IS
    'Whether an informant (parent, sibling, partner) can corroborate childhood symptoms.';
COMMENT ON COLUMN assessment_childhood_history.informant_details IS
    'Details from the informant about childhood symptoms.';

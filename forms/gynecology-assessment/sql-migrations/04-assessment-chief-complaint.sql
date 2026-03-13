-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the gynaecology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    symptom_duration VARCHAR(50) NOT NULL DEFAULT '',
    symptom_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_onset IN ('sudden', 'gradual', '')),
    symptom_severity INTEGER
        CHECK (symptom_severity IS NULL OR (symptom_severity >= 1 AND symptom_severity <= 10)),
    symptom_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_pattern IN ('constant', 'intermittent', 'cyclical', '')),
    aggravating_factors TEXT NOT NULL DEFAULT '',
    relieving_factors TEXT NOT NULL DEFAULT '',
    impact_on_daily_life VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_daily_life IN ('none', 'mild', 'moderate', 'severe', '')),
    previous_treatment_for_complaint VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_treatment_for_complaint IN ('yes', 'no', '')),
    previous_treatment_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: primary gynaecological concern, duration, severity, and pattern. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Free-text description of the primary gynaecological complaint.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_duration IS
    'Duration of symptoms (e.g. 3 months, 2 years).';
COMMENT ON COLUMN assessment_chief_complaint.symptom_onset IS
    'Onset type: sudden, gradual, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_severity IS
    'Severity rating from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.symptom_pattern IS
    'Symptom pattern: constant, intermittent, cyclical, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.aggravating_factors IS
    'Factors that worsen symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.relieving_factors IS
    'Factors that relieve symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.impact_on_daily_life IS
    'Impact on daily life: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment_for_complaint IS
    'Whether previous treatment has been received for this complaint: yes, no, or empty string.';
COMMENT ON COLUMN assessment_chief_complaint.previous_treatment_details IS
    'Details of previous treatment.';

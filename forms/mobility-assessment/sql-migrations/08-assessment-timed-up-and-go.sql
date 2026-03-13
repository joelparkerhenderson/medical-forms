-- 08_assessment_timed_up_and_go.sql
-- Timed Up and Go (TUG) section of the mobility assessment.

CREATE TABLE assessment_timed_up_and_go (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    tug_time_seconds NUMERIC(5,1),
    tug_risk_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tug_risk_category IN ('normal', 'moderate-risk', 'high-risk', '')),
    assistive_device_used VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (assistive_device_used IN ('yes', 'no', '')),
    assistive_device_type VARCHAR(50) NOT NULL DEFAULT '',
    unsteadiness_observed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unsteadiness_observed IN ('yes', 'no', '')),
    required_physical_assistance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (required_physical_assistance IN ('yes', 'no', '')),
    trial_count INTEGER
        CHECK (trial_count IS NULL OR (trial_count >= 1 AND trial_count <= 5)),
    tug_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_timed_up_and_go_updated_at
    BEFORE UPDATE ON assessment_timed_up_and_go
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_timed_up_and_go IS
    'Timed Up and Go (TUG) test section: measures time to rise from chair, walk 3m, turn, walk back, and sit. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_timed_up_and_go.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_timed_up_and_go.tug_time_seconds IS
    'Time to complete the Timed Up and Go test in seconds.';
COMMENT ON COLUMN assessment_timed_up_and_go.tug_risk_category IS
    'TUG risk category: normal (<12s), moderate-risk (12-20s), high-risk (>20s), or empty string.';
COMMENT ON COLUMN assessment_timed_up_and_go.assistive_device_used IS
    'Whether an assistive device was used during the TUG: yes, no, or empty string.';
COMMENT ON COLUMN assessment_timed_up_and_go.assistive_device_type IS
    'Type of assistive device used (e.g. walking stick, frame, rollator).';
COMMENT ON COLUMN assessment_timed_up_and_go.unsteadiness_observed IS
    'Whether unsteadiness was observed during the test: yes, no, or empty string.';
COMMENT ON COLUMN assessment_timed_up_and_go.required_physical_assistance IS
    'Whether the patient required physical assistance during the test: yes, no, or empty string.';
COMMENT ON COLUMN assessment_timed_up_and_go.trial_count IS
    'Number of trials performed (typically 1-3).';
COMMENT ON COLUMN assessment_timed_up_and_go.tug_notes IS
    'Free-text clinician observations on the TUG test.';

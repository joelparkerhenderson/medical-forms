-- 03_assessment_presenting_complaint.sql
-- Presenting complaint section of the psychiatry assessment.

CREATE TABLE assessment_presenting_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chief_complaint TEXT NOT NULL DEFAULT '',
    onset_date DATE,
    onset_description VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_description IN ('acute', 'gradual', 'chronic', '')),
    duration TEXT NOT NULL DEFAULT '',
    severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity IN ('mild', 'moderate', 'severe', '')),
    precipitating_factors TEXT NOT NULL DEFAULT '',
    aggravating_factors TEXT NOT NULL DEFAULT '',
    relieving_factors TEXT NOT NULL DEFAULT '',
    previous_episodes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_episodes IN ('yes', 'no', '')),
    previous_episode_details TEXT NOT NULL DEFAULT '',
    referral_source VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (referral_source IN ('gp', 'self', 'emergency', 'crisis-team', 'police', 'court', 'other', '')),
    referral_reason TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_presenting_complaint_updated_at
    BEFORE UPDATE ON assessment_presenting_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_presenting_complaint IS
    'Presenting complaint section: chief complaint, onset, severity, precipitating factors, and referral source. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_presenting_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_presenting_complaint.chief_complaint IS
    'Primary presenting complaint in the patient''s own words.';
COMMENT ON COLUMN assessment_presenting_complaint.onset_date IS
    'Approximate date when symptoms began.';
COMMENT ON COLUMN assessment_presenting_complaint.onset_description IS
    'Nature of onset: acute, gradual, chronic, or empty.';
COMMENT ON COLUMN assessment_presenting_complaint.severity IS
    'Current severity of the presenting complaint: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_presenting_complaint.precipitating_factors IS
    'Free-text description of factors that precipitated the current episode.';
COMMENT ON COLUMN assessment_presenting_complaint.aggravating_factors IS
    'Free-text description of factors that worsen symptoms.';
COMMENT ON COLUMN assessment_presenting_complaint.relieving_factors IS
    'Free-text description of factors that improve symptoms.';
COMMENT ON COLUMN assessment_presenting_complaint.previous_episodes IS
    'Whether the patient has had previous similar episodes.';
COMMENT ON COLUMN assessment_presenting_complaint.referral_source IS
    'Source of referral: gp, self, emergency, crisis-team, police, court, other, or empty.';

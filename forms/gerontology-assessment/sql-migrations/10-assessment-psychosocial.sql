-- 10_assessment_psychosocial.sql
-- Psychosocial section of the gerontology assessment.

CREATE TABLE assessment_psychosocial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mood_screen VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (mood_screen IN ('normal', 'low', 'depressed', '')),
    geriatric_depression_scale_score INTEGER
        CHECK (geriatric_depression_scale_score IS NULL OR (geriatric_depression_scale_score >= 0 AND geriatric_depression_scale_score <= 15)),
    anxiety_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_present IN ('yes', 'no', '')),
    social_isolation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_isolation IN ('yes', 'no', '')),
    loneliness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (loneliness IN ('yes', 'no', '')),
    social_activities_participation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_activities_participation IN ('regular', 'occasional', 'none', '')),
    carer_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_available IN ('yes', 'no', '')),
    carer_relationship VARCHAR(100) NOT NULL DEFAULT '',
    carer_stress VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_stress IN ('yes', 'no', '')),
    carer_stress_details TEXT NOT NULL DEFAULT '',
    bereavement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bereavement IN ('yes', 'no', '')),
    bereavement_details TEXT NOT NULL DEFAULT '',
    financial_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_concerns IN ('yes', 'no', '')),
    elder_abuse_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (elder_abuse_concerns IN ('yes', 'no', '')),
    safeguarding_referral_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_referral_needed IN ('yes', 'no', '')),
    psychosocial_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychosocial_updated_at
    BEFORE UPDATE ON assessment_psychosocial
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychosocial IS
    'Psychosocial section: mood, social isolation, carer status, bereavement, and safeguarding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychosocial.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychosocial.mood_screen IS
    'Mood screening result: normal, low, depressed, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.geriatric_depression_scale_score IS
    'Geriatric Depression Scale (GDS-15) score (0-15), NULL if not assessed.';
COMMENT ON COLUMN assessment_psychosocial.anxiety_present IS
    'Whether anxiety is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.social_isolation IS
    'Whether the patient is socially isolated: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.loneliness IS
    'Whether the patient reports loneliness: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.social_activities_participation IS
    'Social activities participation level: regular, occasional, none, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.carer_available IS
    'Whether a carer is available: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.carer_relationship IS
    'Relationship of the carer to the patient.';
COMMENT ON COLUMN assessment_psychosocial.carer_stress IS
    'Whether the carer reports stress or burnout: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.carer_stress_details IS
    'Details of carer stress.';
COMMENT ON COLUMN assessment_psychosocial.bereavement IS
    'Whether the patient has experienced recent bereavement: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.bereavement_details IS
    'Details of bereavement.';
COMMENT ON COLUMN assessment_psychosocial.financial_concerns IS
    'Whether there are financial concerns: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.elder_abuse_concerns IS
    'Whether there are concerns about elder abuse: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.safeguarding_referral_needed IS
    'Whether a safeguarding referral is needed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_psychosocial.psychosocial_notes IS
    'Free-text notes on psychosocial assessment.';

-- 03_assessment_demographics.sql
-- Demographics section of the kinesiology assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    occupation VARCHAR(255) NOT NULL DEFAULT '',
    sport_or_activity VARCHAR(255) NOT NULL DEFAULT '',
    activity_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'vigorous', 'elite', '')),
    dominant_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (dominant_side IN ('left', 'right', 'ambidextrous', '')),
    contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    contact_email VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: occupation, sport, activity level, and dominant side. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient occupation or primary work role.';
COMMENT ON COLUMN assessment_demographics.sport_or_activity IS
    'Primary sport or physical activity the patient participates in.';
COMMENT ON COLUMN assessment_demographics.activity_level IS
    'Self-reported activity level: sedentary, light, moderate, vigorous, elite, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.dominant_side IS
    'Dominant side: left, right, ambidextrous, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.contact_phone IS
    'Patient contact phone number.';
COMMENT ON COLUMN assessment_demographics.contact_email IS
    'Patient contact email address.';

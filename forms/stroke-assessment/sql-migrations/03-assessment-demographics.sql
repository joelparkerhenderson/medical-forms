-- 03_assessment_demographics.sql
-- Demographics section of the stroke assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    handedness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (handedness IN ('right', 'left', 'ambidextrous', '')),
    pre_stroke_mrs_score INTEGER
        CHECK (pre_stroke_mrs_score IS NULL OR (pre_stroke_mrs_score >= 0 AND pre_stroke_mrs_score <= 6)),
    pre_stroke_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pre_stroke_independence IN ('independent', 'some_assistance', 'dependent', '')),
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(50) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: ethnicity, handedness, pre-stroke function, and emergency contact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient self-reported ethnicity.';
COMMENT ON COLUMN assessment_demographics.handedness IS
    'Handedness: right, left, ambidextrous, or empty string (relevant for hemisphere localisation).';
COMMENT ON COLUMN assessment_demographics.pre_stroke_mrs_score IS
    'Pre-stroke modified Rankin Scale score (0-6); baseline functional status.';
COMMENT ON COLUMN assessment_demographics.pre_stroke_independence IS
    'Pre-stroke independence level: independent, some_assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_name IS
    'Emergency contact name.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_phone IS
    'Emergency contact phone number.';

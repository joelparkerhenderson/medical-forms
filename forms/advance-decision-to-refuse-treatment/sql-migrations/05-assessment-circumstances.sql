-- 05_assessment_circumstances.sql
-- Circumstances section of the advance decision to refuse treatment.

CREATE TABLE assessment_circumstances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    circumstances_description TEXT NOT NULL DEFAULT '',
    specific_conditions TEXT NOT NULL DEFAULT '',
    applies_if_terminally_ill VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (applies_if_terminally_ill IN ('yes', 'no', '')),
    applies_if_permanently_unconscious VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (applies_if_permanently_unconscious IN ('yes', 'no', '')),
    applies_if_severely_brain_damaged VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (applies_if_severely_brain_damaged IN ('yes', 'no', '')),
    applies_if_advanced_dementia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (applies_if_advanced_dementia IN ('yes', 'no', '')),
    other_circumstances TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_circumstances_updated_at
    BEFORE UPDATE ON assessment_circumstances
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_circumstances IS
    'Circumstances section: defines the medical situations under which the advance decision applies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_circumstances.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_circumstances.circumstances_description IS
    'General description of the circumstances in which the advance decision applies.';
COMMENT ON COLUMN assessment_circumstances.specific_conditions IS
    'Specific medical conditions or diagnoses to which this decision applies.';
COMMENT ON COLUMN assessment_circumstances.applies_if_terminally_ill IS
    'Whether this decision applies if the person is terminally ill.';
COMMENT ON COLUMN assessment_circumstances.applies_if_permanently_unconscious IS
    'Whether this decision applies if the person is permanently unconscious.';
COMMENT ON COLUMN assessment_circumstances.applies_if_severely_brain_damaged IS
    'Whether this decision applies if the person has severe brain damage.';
COMMENT ON COLUMN assessment_circumstances.applies_if_advanced_dementia IS
    'Whether this decision applies if the person has advanced dementia.';
COMMENT ON COLUMN assessment_circumstances.other_circumstances IS
    'Free-text description of any other circumstances to which this decision applies.';

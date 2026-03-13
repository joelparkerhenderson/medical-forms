-- 10_assessment_practical_matters.sql
-- Practical matters section of the advance statement about care.

CREATE TABLE assessment_practical_matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    financial_arrangements TEXT NOT NULL DEFAULT '',
    property_arrangements TEXT NOT NULL DEFAULT '',
    insurance_details TEXT NOT NULL DEFAULT '',
    will_location TEXT NOT NULL DEFAULT '',
    has_lasting_power_of_attorney VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_lasting_power_of_attorney IN ('yes', 'no', '')),
    lpa_details TEXT NOT NULL DEFAULT '',
    funeral_wishes TEXT NOT NULL DEFAULT '',
    burial_or_cremation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (burial_or_cremation IN ('burial', 'cremation', 'other', '')),
    other_practical_matters TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_practical_matters_updated_at
    BEFORE UPDATE ON assessment_practical_matters
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_practical_matters IS
    'Practical matters section: financial, legal, and end-of-life practical arrangements. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_practical_matters.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_practical_matters.financial_arrangements IS
    'Details of financial arrangements or instructions.';
COMMENT ON COLUMN assessment_practical_matters.property_arrangements IS
    'Arrangements for property and possessions.';
COMMENT ON COLUMN assessment_practical_matters.insurance_details IS
    'Relevant insurance policies and details.';
COMMENT ON COLUMN assessment_practical_matters.will_location IS
    'Location of the person will and executor details.';
COMMENT ON COLUMN assessment_practical_matters.has_lasting_power_of_attorney IS
    'Whether the person has a Lasting Power of Attorney in place.';
COMMENT ON COLUMN assessment_practical_matters.lpa_details IS
    'Details of the Lasting Power of Attorney arrangement.';
COMMENT ON COLUMN assessment_practical_matters.funeral_wishes IS
    'Wishes regarding funeral arrangements.';
COMMENT ON COLUMN assessment_practical_matters.burial_or_cremation IS
    'Preference for burial, cremation, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_practical_matters.other_practical_matters IS
    'Any other practical matters the person wants to record.';

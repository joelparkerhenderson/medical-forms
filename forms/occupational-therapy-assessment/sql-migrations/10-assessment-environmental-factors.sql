-- 10_assessment_environmental_factors.sql
-- Environmental factors section of the occupational therapy assessment.

CREATE TABLE assessment_environmental_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    home_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (home_type IN ('house', 'flat', 'bungalow', 'sheltered-housing', 'care-home', 'other', '')),
    home_type_details TEXT NOT NULL DEFAULT '',
    number_of_floors INTEGER
        CHECK (number_of_floors IS NULL OR (number_of_floors >= 0 AND number_of_floors <= 10)),
    stairs_access VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stairs_access IN ('yes', 'no', '')),
    stair_rail_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stair_rail_present IN ('yes', 'no', '')),
    bathroom_accessibility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bathroom_accessibility IN ('fully-accessible', 'partially-accessible', 'not-accessible', '')),
    kitchen_accessibility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (kitchen_accessibility IN ('fully-accessible', 'partially-accessible', 'not-accessible', '')),
    bedroom_location VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bedroom_location IN ('ground-floor', 'upper-floor', 'basement', '')),
    home_modifications_in_place TEXT NOT NULL DEFAULT '',
    home_modifications_recommended TEXT NOT NULL DEFAULT '',
    transport_access TEXT NOT NULL DEFAULT '',
    community_resources TEXT NOT NULL DEFAULT '',
    social_support_network TEXT NOT NULL DEFAULT '',
    environmental_barriers TEXT NOT NULL DEFAULT '',
    environmental_facilitators TEXT NOT NULL DEFAULT '',
    environmental_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_environmental_factors_updated_at
    BEFORE UPDATE ON assessment_environmental_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_environmental_factors IS
    'Environmental factors section: home setup, accessibility, modifications, and community resources. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_environmental_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_environmental_factors.home_type IS
    'Type of home: house, flat, bungalow, sheltered-housing, care-home, other, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.home_type_details IS
    'Additional details about the home type or layout.';
COMMENT ON COLUMN assessment_environmental_factors.number_of_floors IS
    'Number of floors in the home.';
COMMENT ON COLUMN assessment_environmental_factors.stairs_access IS
    'Whether stairs are required to access the home: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.stair_rail_present IS
    'Whether a stair rail is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.bathroom_accessibility IS
    'Accessibility level of the bathroom: fully-accessible, partially-accessible, not-accessible, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.kitchen_accessibility IS
    'Accessibility level of the kitchen: fully-accessible, partially-accessible, not-accessible, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.bedroom_location IS
    'Location of the bedroom: ground-floor, upper-floor, basement, or empty.';
COMMENT ON COLUMN assessment_environmental_factors.home_modifications_in_place IS
    'Existing home modifications (e.g. grab rails, ramps, wet room).';
COMMENT ON COLUMN assessment_environmental_factors.home_modifications_recommended IS
    'Recommended home modifications for improved function and safety.';
COMMENT ON COLUMN assessment_environmental_factors.transport_access IS
    'Available transport options and accessibility.';
COMMENT ON COLUMN assessment_environmental_factors.community_resources IS
    'Community resources currently used or available.';
COMMENT ON COLUMN assessment_environmental_factors.social_support_network IS
    'Description of the patient social support network.';
COMMENT ON COLUMN assessment_environmental_factors.environmental_barriers IS
    'Environmental barriers to occupational performance.';
COMMENT ON COLUMN assessment_environmental_factors.environmental_facilitators IS
    'Environmental facilitators supporting occupational performance.';
COMMENT ON COLUMN assessment_environmental_factors.environmental_notes IS
    'Additional clinician notes on environmental factors.';

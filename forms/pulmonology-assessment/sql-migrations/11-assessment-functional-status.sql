-- 11_assessment_functional_status.sql
-- Functional status section of the pulmonology assessment.

CREATE TABLE assessment_functional_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    adl_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adl_independence IN ('independent', 'some-assistance', 'dependent', '')),
    mobility_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mobility_level IN ('unrestricted', 'limited', 'housebound', 'bedbound', '')),
    aids_used TEXT NOT NULL DEFAULT '',
    pulmonary_rehabilitation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pulmonary_rehabilitation IN ('completed', 'ongoing', 'declined', 'not-offered', '')),
    rehab_benefit VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (rehab_benefit IN ('significant', 'moderate', 'minimal', 'none', '')),
    home_oxygen_assessment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (home_oxygen_assessment IN ('yes', 'no', '')),
    ambulatory_oxygen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ambulatory_oxygen IN ('yes', 'no', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('drives', 'stopped-driving', 'never-drove', '')),
    employment_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_impact IN ('none', 'reduced-hours', 'unable-to-work', 'retired', '')),
    social_isolation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_isolation IN ('yes', 'no', '')),
    carer_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support IN ('yes', 'no', '')),
    advance_care_planning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_care_planning IN ('yes', 'no', '')),
    advance_care_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_status_updated_at
    BEFORE UPDATE ON assessment_functional_status
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_status IS
    'Functional status section: activities of daily living, mobility, pulmonary rehabilitation, oxygen assessment, and advance care planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_status.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_status.adl_independence IS
    'Independence in activities of daily living: independent, some-assistance, dependent, or empty.';
COMMENT ON COLUMN assessment_functional_status.mobility_level IS
    'Mobility level: unrestricted, limited, housebound, bedbound, or empty.';
COMMENT ON COLUMN assessment_functional_status.aids_used IS
    'Free-text description of mobility or respiratory aids used (wheelchair, rollator, portable oxygen).';
COMMENT ON COLUMN assessment_functional_status.pulmonary_rehabilitation IS
    'Pulmonary rehabilitation status: completed, ongoing, declined, not-offered, or empty.';
COMMENT ON COLUMN assessment_functional_status.rehab_benefit IS
    'Benefit from pulmonary rehabilitation: significant, moderate, minimal, none, or empty.';
COMMENT ON COLUMN assessment_functional_status.home_oxygen_assessment IS
    'Whether a home oxygen assessment has been performed.';
COMMENT ON COLUMN assessment_functional_status.ambulatory_oxygen IS
    'Whether the patient uses ambulatory (portable) oxygen.';
COMMENT ON COLUMN assessment_functional_status.employment_impact IS
    'Impact on employment: none, reduced-hours, unable-to-work, retired, or empty.';
COMMENT ON COLUMN assessment_functional_status.social_isolation IS
    'Whether the patient experiences social isolation due to respiratory disease.';
COMMENT ON COLUMN assessment_functional_status.advance_care_planning IS
    'Whether advance care planning has been discussed.';

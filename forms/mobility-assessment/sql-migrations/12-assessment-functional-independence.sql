-- 12_assessment_functional_independence.sql
-- Functional independence section of the mobility assessment.

CREATE TABLE assessment_functional_independence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    transfers VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (transfers IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    indoor_mobility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (indoor_mobility IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    outdoor_mobility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outdoor_mobility IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    stair_negotiation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stair_negotiation IN ('independent', 'supervision', 'with-rail', 'unable', '')),
    bathing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bathing IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    dressing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dressing IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    toileting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (toileting IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    meal_preparation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (meal_preparation IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    shopping VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (shopping IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    community_access VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (community_access IN ('independent', 'supervision', 'minimal-assist', 'moderate-assist', 'dependent', '')),
    carer_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support IN ('yes', 'no', '')),
    carer_details TEXT NOT NULL DEFAULT '',
    functional_goals TEXT NOT NULL DEFAULT '',
    functional_independence_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_independence_updated_at
    BEFORE UPDATE ON assessment_functional_independence
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_independence IS
    'Functional independence section: ADL and IADL independence levels, carer support, and goals. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_independence.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_independence.transfers IS
    'Transfer independence level: independent, supervision, minimal-assist, moderate-assist, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_independence.indoor_mobility IS
    'Indoor mobility level: independent, supervision, minimal-assist, moderate-assist, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_independence.outdoor_mobility IS
    'Outdoor mobility level: independent, supervision, minimal-assist, moderate-assist, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_independence.stair_negotiation IS
    'Ability to negotiate stairs: independent, supervision, with-rail, unable, or empty string.';
COMMENT ON COLUMN assessment_functional_independence.bathing IS
    'Bathing independence level.';
COMMENT ON COLUMN assessment_functional_independence.dressing IS
    'Dressing independence level.';
COMMENT ON COLUMN assessment_functional_independence.toileting IS
    'Toileting independence level.';
COMMENT ON COLUMN assessment_functional_independence.meal_preparation IS
    'Meal preparation independence level.';
COMMENT ON COLUMN assessment_functional_independence.shopping IS
    'Shopping independence level.';
COMMENT ON COLUMN assessment_functional_independence.community_access IS
    'Community access independence level.';
COMMENT ON COLUMN assessment_functional_independence.carer_support IS
    'Whether the patient receives carer support: yes, no, or empty string.';
COMMENT ON COLUMN assessment_functional_independence.carer_details IS
    'Free-text details of carer support (frequency, type).';
COMMENT ON COLUMN assessment_functional_independence.functional_goals IS
    'Free-text description of patient functional goals.';
COMMENT ON COLUMN assessment_functional_independence.functional_independence_notes IS
    'Free-text clinician notes on functional independence.';

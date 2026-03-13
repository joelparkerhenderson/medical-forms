-- 10_assessment_social_environmental.sql
-- Social and environmental section of the pediatric assessment.

CREATE TABLE assessment_social_environmental (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    living_arrangement VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (living_arrangement IN ('two-parents', 'single-parent', 'foster-care', 'kinship-care', 'residential', 'other', '')),
    living_arrangement_details TEXT NOT NULL DEFAULT '',
    number_of_siblings INTEGER
        CHECK (number_of_siblings IS NULL OR number_of_siblings >= 0),
    childcare_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (childcare_type IN ('nursery', 'childminder', 'family', 'school', 'none', 'other', '')),
    school_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (school_type IN ('mainstream', 'special-school', 'home-schooled', 'not-school-age', 'other', '')),
    school_performance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (school_performance IN ('above-average', 'average', 'below-average', 'not-applicable', '')),
    behavioural_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (behavioural_concerns IN ('yes', 'no', '')),
    behavioural_concern_details TEXT NOT NULL DEFAULT '',
    social_services_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_services_involved IN ('yes', 'no', '')),
    safeguarding_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_concerns IN ('yes', 'no', '')),
    safeguarding_details TEXT NOT NULL DEFAULT '',
    household_smoking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (household_smoking IN ('yes', 'no', '')),
    housing_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (housing_concerns IN ('yes', 'no', '')),
    housing_concern_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_environmental_updated_at
    BEFORE UPDATE ON assessment_social_environmental
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_environmental IS
    'Social and environmental section: living arrangements, childcare, education, safeguarding, and home environment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_environmental.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_environmental.living_arrangement IS
    'Primary living arrangement: two-parents, single-parent, foster-care, kinship-care, residential, other, or empty.';
COMMENT ON COLUMN assessment_social_environmental.number_of_siblings IS
    'Number of siblings in the household.';
COMMENT ON COLUMN assessment_social_environmental.childcare_type IS
    'Type of childcare arrangement: nursery, childminder, family, school, none, other, or empty.';
COMMENT ON COLUMN assessment_social_environmental.school_type IS
    'Type of school attended: mainstream, special-school, home-schooled, not-school-age, other, or empty.';
COMMENT ON COLUMN assessment_social_environmental.school_performance IS
    'General school performance: above-average, average, below-average, not-applicable, or empty.';
COMMENT ON COLUMN assessment_social_environmental.behavioural_concerns IS
    'Whether there are any behavioural concerns at home or school.';
COMMENT ON COLUMN assessment_social_environmental.social_services_involved IS
    'Whether social services are currently involved with the family.';
COMMENT ON COLUMN assessment_social_environmental.safeguarding_concerns IS
    'Whether there are any safeguarding concerns.';
COMMENT ON COLUMN assessment_social_environmental.household_smoking IS
    'Whether anyone in the household smokes.';
COMMENT ON COLUMN assessment_social_environmental.housing_concerns IS
    'Whether there are concerns about housing conditions (damp, overcrowding, etc.).';

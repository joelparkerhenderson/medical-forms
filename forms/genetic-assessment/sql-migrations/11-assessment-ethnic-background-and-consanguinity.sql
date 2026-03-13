-- 11_assessment_ethnic_background_and_consanguinity.sql
-- Ethnic background and consanguinity section of the genetic assessment.

CREATE TABLE assessment_ethnic_background_and_consanguinity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    maternal_ethnic_background VARCHAR(255) NOT NULL DEFAULT '',
    paternal_ethnic_background VARCHAR(255) NOT NULL DEFAULT '',
    maternal_country_of_origin VARCHAR(100) NOT NULL DEFAULT '',
    paternal_country_of_origin VARCHAR(100) NOT NULL DEFAULT '',
    ashkenazi_jewish_ancestry VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ashkenazi_jewish_ancestry IN ('yes', 'no', '')),
    ashkenazi_lineage VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ashkenazi_lineage IN ('maternal', 'paternal', 'both', '')),
    consanguinity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consanguinity IN ('yes', 'no', '')),
    consanguinity_degree VARCHAR(50) NOT NULL DEFAULT '',
    endogamous_community VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (endogamous_community IN ('yes', 'no', '')),
    endogamous_community_details TEXT NOT NULL DEFAULT '',
    population_specific_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_ethnic_background_and_consanguinity_updated_at
    BEFORE UPDATE ON assessment_ethnic_background_and_consanguinity
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_ethnic_background_and_consanguinity IS
    'Ethnic background and consanguinity section: parental origins, Ashkenazi ancestry, consanguinity, and endogamous community. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.maternal_ethnic_background IS
    'Maternal ethnic background.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.paternal_ethnic_background IS
    'Paternal ethnic background.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.maternal_country_of_origin IS
    'Country of origin on the maternal side.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.paternal_country_of_origin IS
    'Country of origin on the paternal side.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.ashkenazi_jewish_ancestry IS
    'Whether there is Ashkenazi Jewish ancestry: yes, no, or empty string.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.ashkenazi_lineage IS
    'Lineage of Ashkenazi ancestry: maternal, paternal, both, or empty string.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.consanguinity IS
    'Whether the parents are consanguineous (blood-related): yes, no, or empty string.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.consanguinity_degree IS
    'Degree of consanguinity (e.g. first cousins, second cousins).';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.endogamous_community IS
    'Whether the family belongs to an endogamous community: yes, no, or empty string.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.endogamous_community_details IS
    'Details of the endogamous community.';
COMMENT ON COLUMN assessment_ethnic_background_and_consanguinity.population_specific_conditions IS
    'Free-text list of population-specific genetic conditions to consider (e.g. Tay-Sachs, sickle cell).';

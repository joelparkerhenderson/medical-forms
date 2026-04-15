-- 03_assessment_practice_configuration.sql
-- Practice-specific configuration values that populate the privacy notice template.

CREATE TABLE assessment_practice_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    practice_name VARCHAR(255) NOT NULL DEFAULT '',
    practice_address TEXT NOT NULL DEFAULT '',
    dpo_name VARCHAR(255) NOT NULL DEFAULT '',
    dpo_contact_details TEXT NOT NULL DEFAULT '',
    research_organisations TEXT NOT NULL DEFAULT '',
    data_sharing_partners TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_practice_configuration_updated_at
    BEFORE UPDATE ON assessment_practice_configuration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_practice_configuration IS
    'Practice-specific configuration values that populate placeholder fields in the BMA GDPR privacy notice template.';
COMMENT ON COLUMN assessment_practice_configuration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_practice_configuration.practice_name IS
    'Name of the GP practice.';
COMMENT ON COLUMN assessment_practice_configuration.practice_address IS
    'Address of the GP practice.';
COMMENT ON COLUMN assessment_practice_configuration.dpo_name IS
    'Name of the Data Protection Officer.';
COMMENT ON COLUMN assessment_practice_configuration.dpo_contact_details IS
    'Contact details for the Data Protection Officer.';
COMMENT ON COLUMN assessment_practice_configuration.research_organisations IS
    'Names of research organisations the practice shares data with.';
COMMENT ON COLUMN assessment_practice_configuration.data_sharing_partners IS
    'Names of NHS organisations the practice shares data with.';

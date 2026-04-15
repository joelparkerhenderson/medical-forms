-- 03-practice-configuration.sql
-- Practice-level configuration for the care privacy notice, including DPO and data-sharing details.

CREATE TABLE practice_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    practice_name VARCHAR(255) NOT NULL DEFAULT '',
    practice_address TEXT NOT NULL DEFAULT '',
    dpo_name VARCHAR(255) NOT NULL DEFAULT '',
    dpo_contact_details TEXT NOT NULL DEFAULT '',
    research_organisations TEXT NOT NULL DEFAULT '',
    data_sharing_partners TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_practice_configuration_updated_at
    BEFORE UPDATE ON practice_configuration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE practice_configuration IS
    'Practice-level configuration for the care privacy notice. Holds customisable text inserted into the notice shown to patients.';
COMMENT ON COLUMN practice_configuration.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN practice_configuration.practice_name IS
    'Name of the GP practice or healthcare organisation.';
COMMENT ON COLUMN practice_configuration.practice_address IS
    'Postal address of the GP practice or healthcare organisation.';
COMMENT ON COLUMN practice_configuration.dpo_name IS
    'Name of the Data Protection Officer (DPO) for the practice.';
COMMENT ON COLUMN practice_configuration.dpo_contact_details IS
    'Contact details (email, phone, or postal address) for the DPO.';
COMMENT ON COLUMN practice_configuration.research_organisations IS
    'Names or descriptions of research organisations the practice shares data with, if any.';
COMMENT ON COLUMN practice_configuration.data_sharing_partners IS
    'Names or descriptions of other organisations the practice shares patient data with.';
COMMENT ON COLUMN practice_configuration.created_at IS
    'Timestamp when the row was created.';
COMMENT ON COLUMN practice_configuration.updated_at IS
    'Timestamp when the row was last updated.';

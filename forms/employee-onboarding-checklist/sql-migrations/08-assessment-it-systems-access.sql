-- 08_assessment_it_systems_access.sql
-- IT systems and access section of the onboarding assessment.

CREATE TABLE assessment_it_systems_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nhs_smartcard_issued VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nhs_smartcard_issued IN ('yes', 'no', '')),
    nhs_smartcard_number VARCHAR(50) NOT NULL DEFAULT '',
    email_account_created VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (email_account_created IN ('yes', 'no', '')),
    network_login_created VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (network_login_created IN ('yes', 'no', '')),
    clinical_system_access VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clinical_system_access IN ('yes', 'no', '')),
    clinical_system_name VARCHAR(100) NOT NULL DEFAULT '',
    clinical_system_training_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clinical_system_training_completed IN ('yes', 'no', '')),
    rostering_system_access VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rostering_system_access IN ('yes', 'no', '')),
    phone_extension VARCHAR(20) NOT NULL DEFAULT '',
    bleep_number VARCHAR(20) NOT NULL DEFAULT '',
    it_access_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_it_systems_access_updated_at
    BEFORE UPDATE ON assessment_it_systems_access
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_it_systems_access IS
    'IT systems and access section: smartcard, email, clinical systems, rostering. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_it_systems_access.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_it_systems_access.nhs_smartcard_issued IS
    'Whether an NHS smartcard has been issued: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.nhs_smartcard_number IS
    'NHS smartcard number.';
COMMENT ON COLUMN assessment_it_systems_access.email_account_created IS
    'Whether an email account has been created: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.network_login_created IS
    'Whether a network login has been created: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.clinical_system_access IS
    'Whether access to the clinical system has been granted: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.clinical_system_name IS
    'Name of the clinical system (e.g. EMIS, SystmOne, Epic).';
COMMENT ON COLUMN assessment_it_systems_access.clinical_system_training_completed IS
    'Whether clinical system training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.rostering_system_access IS
    'Whether access to the rostering system has been granted: yes, no, or empty.';
COMMENT ON COLUMN assessment_it_systems_access.phone_extension IS
    'Allocated phone extension number.';
COMMENT ON COLUMN assessment_it_systems_access.bleep_number IS
    'Allocated bleep or pager number.';
COMMENT ON COLUMN assessment_it_systems_access.it_access_notes IS
    'Additional notes on IT systems and access.';

-- 04_assessment_donor_registration_hla_typing.sql
-- Donor registration and HLA typing section of the bone marrow donation assessment.

CREATE TABLE assessment_donor_registration_hla_typing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    donor_registry VARCHAR(100) NOT NULL DEFAULT '',
    donor_registry_id VARCHAR(100) NOT NULL DEFAULT '',
    registration_date DATE,
    donation_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (donation_type IN ('allogeneic', 'autologous', '')),
    recipient_relationship VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (recipient_relationship IN ('related', 'unrelated', '')),
    hla_a VARCHAR(50) NOT NULL DEFAULT '',
    hla_b VARCHAR(50) NOT NULL DEFAULT '',
    hla_c VARCHAR(50) NOT NULL DEFAULT '',
    hla_drb1 VARCHAR(50) NOT NULL DEFAULT '',
    hla_dqb1 VARCHAR(50) NOT NULL DEFAULT '',
    hla_dpb1 VARCHAR(50) NOT NULL DEFAULT '',
    hla_match_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hla_match_level IN ('10-of-10', '9-of-10', '8-of-10', '7-of-10', 'haploidentical', '')),
    crossmatch_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (crossmatch_result IN ('negative', 'positive', 'pending', '')),
    previous_donation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_donation IN ('yes', 'no', '')),
    previous_donation_details TEXT NOT NULL DEFAULT '',
    hla_typing_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_donor_registration_hla_typing_updated_at
    BEFORE UPDATE ON assessment_donor_registration_hla_typing
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_donor_registration_hla_typing IS
    'Donor registration and HLA typing section: registry details, HLA loci, match level, crossmatch. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.donor_registry IS
    'Name of the donor registry (e.g. Anthony Nolan, DKMS, NMDP).';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.donor_registry_id IS
    'Unique identifier within the donor registry.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.registration_date IS
    'Date of initial donor registration.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.donation_type IS
    'Type of donation: allogeneic or autologous.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.recipient_relationship IS
    'Relationship to recipient: related or unrelated.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_a IS
    'HLA-A typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_b IS
    'HLA-B typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_c IS
    'HLA-C typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_drb1 IS
    'HLA-DRB1 typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_dqb1 IS
    'HLA-DQB1 typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_dpb1 IS
    'HLA-DPB1 typing result.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_match_level IS
    'HLA match level with recipient: 10-of-10, 9-of-10, 8-of-10, 7-of-10, haploidentical, or empty.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.crossmatch_result IS
    'Crossmatch result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.previous_donation IS
    'Whether donor has previously donated: yes, no, or empty.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.previous_donation_details IS
    'Details of previous donation if applicable.';
COMMENT ON COLUMN assessment_donor_registration_hla_typing.hla_typing_notes IS
    'Additional clinician notes on HLA typing and matching.';

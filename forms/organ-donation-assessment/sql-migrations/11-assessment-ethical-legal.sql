-- 11_assessment_ethical_legal.sql
-- Ethical and legal requirements section of the organ donation assessment.

CREATE TABLE assessment_ethical_legal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    consent_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (consent_type IN ('donor-consent', 'family-consent', 'deemed-consent', 'court-authorisation', '')),
    consent_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_obtained IN ('yes', 'no', '')),
    consent_date DATE,
    next_of_kin_consulted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (next_of_kin_consulted IN ('yes', 'no', '')),
    next_of_kin_name VARCHAR(255) NOT NULL DEFAULT '',
    next_of_kin_relationship VARCHAR(50) NOT NULL DEFAULT '',
    coroner_notified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coroner_notified IN ('yes', 'no', 'not-applicable', '')),
    coroner_consent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coroner_consent IN ('yes', 'no', 'not-applicable', '')),
    hta_authorisation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hta_authorisation IN ('yes', 'no', '')),
    hta_reference VARCHAR(100) NOT NULL DEFAULT '',
    independent_assessor_approved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (independent_assessor_approved IN ('yes', 'no', '')),
    ethics_committee_review VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ethics_committee_review IN ('yes', 'no', 'not-applicable', '')),
    legal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_ethical_legal_updated_at
    BEFORE UPDATE ON assessment_ethical_legal
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_ethical_legal IS
    'Ethical and legal requirements section: consent, coroner notification, HTA authorisation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_ethical_legal.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_ethical_legal.consent_type IS
    'Type of consent: donor-consent, family-consent, deemed-consent, court-authorisation, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.consent_obtained IS
    'Whether consent has been obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.consent_date IS
    'Date consent was obtained.';
COMMENT ON COLUMN assessment_ethical_legal.next_of_kin_consulted IS
    'Whether next of kin has been consulted: yes, no, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.next_of_kin_name IS
    'Name of next of kin.';
COMMENT ON COLUMN assessment_ethical_legal.next_of_kin_relationship IS
    'Relationship of next of kin to donor.';
COMMENT ON COLUMN assessment_ethical_legal.coroner_notified IS
    'Whether the coroner has been notified: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.coroner_consent IS
    'Whether the coroner has given consent: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.hta_authorisation IS
    'Whether Human Tissue Authority authorisation is obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.hta_reference IS
    'HTA authorisation reference number.';
COMMENT ON COLUMN assessment_ethical_legal.independent_assessor_approved IS
    'Whether an independent assessor has approved (living donors): yes, no, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.ethics_committee_review IS
    'Whether ethics committee review was required/completed: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_ethical_legal.legal_notes IS
    'Additional clinician notes on ethical and legal requirements.';

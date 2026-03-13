-- 12_assessment_capacity_and_consent.sql
-- Capacity and consent section of the psychiatry assessment.

CREATE TABLE assessment_capacity_and_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    capacity_assessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (capacity_assessed IN ('yes', 'no', '')),
    has_capacity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (has_capacity IN ('yes', 'no', 'unclear', '')),
    understands_information VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_information IN ('yes', 'no', '')),
    retains_information VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (retains_information IN ('yes', 'no', '')),
    weighs_information VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (weighs_information IN ('yes', 'no', '')),
    communicates_decision VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (communicates_decision IN ('yes', 'no', '')),
    capacity_details TEXT NOT NULL DEFAULT '',
    advance_directive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_directive IN ('yes', 'no', '')),
    advance_directive_details TEXT NOT NULL DEFAULT '',
    lasting_power_of_attorney VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lasting_power_of_attorney IN ('yes', 'no', '')),
    lpa_details TEXT NOT NULL DEFAULT '',
    mental_health_act_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (mental_health_act_status IN ('informal', 'section-2', 'section-3', 'section-17', 'cto', 'section-136', 'other', '')),
    mha_details TEXT NOT NULL DEFAULT '',
    consent_to_treatment VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_to_treatment IN ('given', 'refused', 'unable', '')),
    consent_to_share_information VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_to_share_information IN ('given', 'refused', 'unable', '')),
    nearest_relative VARCHAR(255) NOT NULL DEFAULT '',
    nearest_relative_informed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nearest_relative_informed IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_capacity_and_consent_updated_at
    BEFORE UPDATE ON assessment_capacity_and_consent
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_capacity_and_consent IS
    'Capacity and consent section: Mental Capacity Act assessment, advance directives, LPA, Mental Health Act status, and consent. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_capacity_and_consent.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_capacity_and_consent.capacity_assessed IS
    'Whether mental capacity was formally assessed.';
COMMENT ON COLUMN assessment_capacity_and_consent.has_capacity IS
    'Whether the patient has capacity for the relevant decision: yes, no, unclear, or empty.';
COMMENT ON COLUMN assessment_capacity_and_consent.understands_information IS
    'MCA criterion: can the patient understand relevant information.';
COMMENT ON COLUMN assessment_capacity_and_consent.retains_information IS
    'MCA criterion: can the patient retain information long enough to make a decision.';
COMMENT ON COLUMN assessment_capacity_and_consent.weighs_information IS
    'MCA criterion: can the patient weigh information as part of decision-making.';
COMMENT ON COLUMN assessment_capacity_and_consent.communicates_decision IS
    'MCA criterion: can the patient communicate their decision.';
COMMENT ON COLUMN assessment_capacity_and_consent.advance_directive IS
    'Whether the patient has an advance directive or advance decision.';
COMMENT ON COLUMN assessment_capacity_and_consent.lasting_power_of_attorney IS
    'Whether there is a lasting power of attorney for health and welfare.';
COMMENT ON COLUMN assessment_capacity_and_consent.mental_health_act_status IS
    'Mental Health Act status: informal, section-2, section-3, section-17, cto, section-136, other, or empty.';
COMMENT ON COLUMN assessment_capacity_and_consent.consent_to_treatment IS
    'Consent to treatment status: given, refused, unable, or empty.';
COMMENT ON COLUMN assessment_capacity_and_consent.consent_to_share_information IS
    'Consent to share information with other services: given, refused, unable, or empty.';
COMMENT ON COLUMN assessment_capacity_and_consent.nearest_relative IS
    'Name of the nearest relative (as defined by the Mental Health Act).';

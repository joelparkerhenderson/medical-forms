-- 12_assessment_consent_preferences.sql
-- Consent and preferences section of the patient intake assessment.

CREATE TABLE assessment_consent_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    consent_to_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_treatment IN ('yes', 'no', '')),
    consent_to_share_records VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_share_records IN ('yes', 'no', '')),
    consent_to_research VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_research IN ('yes', 'no', '')),
    consent_to_contact_sms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_contact_sms IN ('yes', 'no', '')),
    consent_to_contact_email VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_contact_email IN ('yes', 'no', '')),
    consent_to_contact_phone VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_contact_phone IN ('yes', 'no', '')),
    preferred_contact_method VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'post', '')),
    preferred_appointment_time VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_appointment_time IN ('morning', 'afternoon', 'evening', 'no-preference', '')),
    advance_directive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_directive IN ('yes', 'no', '')),
    advance_directive_details TEXT NOT NULL DEFAULT '',
    power_of_attorney VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (power_of_attorney IN ('yes', 'no', '')),
    power_of_attorney_details TEXT NOT NULL DEFAULT '',
    accessibility_needs TEXT NOT NULL DEFAULT '',
    special_requirements TEXT NOT NULL DEFAULT '',
    patient_signature_date DATE,
    consent_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_consent_preferences_updated_at
    BEFORE UPDATE ON assessment_consent_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_consent_preferences IS
    'Consent and preferences section: treatment consent, data sharing, communication preferences, and advance directives. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_consent_preferences.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_treatment IS
    'Consent to receive medical treatment: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_share_records IS
    'Consent to share medical records with other providers: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_research IS
    'Consent to participate in research studies: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_contact_sms IS
    'Consent to be contacted via SMS: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_contact_email IS
    'Consent to be contacted via email: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.consent_to_contact_phone IS
    'Consent to be contacted via telephone: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.preferred_contact_method IS
    'Preferred contact method: phone, email, sms, post, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.preferred_appointment_time IS
    'Preferred appointment time: morning, afternoon, evening, no-preference, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.advance_directive IS
    'Whether the patient has an advance directive: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.advance_directive_details IS
    'Details of the advance directive.';
COMMENT ON COLUMN assessment_consent_preferences.power_of_attorney IS
    'Whether a lasting power of attorney is in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_preferences.power_of_attorney_details IS
    'Details of the power of attorney.';
COMMENT ON COLUMN assessment_consent_preferences.accessibility_needs IS
    'Accessibility requirements (mobility, hearing, visual, cognitive).';
COMMENT ON COLUMN assessment_consent_preferences.special_requirements IS
    'Any other special requirements or accommodations.';
COMMENT ON COLUMN assessment_consent_preferences.patient_signature_date IS
    'Date the patient signed the consent form.';
COMMENT ON COLUMN assessment_consent_preferences.consent_notes IS
    'Additional notes on consent and preferences.';

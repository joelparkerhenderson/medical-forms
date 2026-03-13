-- 09_assessment_patient_rights.sql
-- Patient rights section of the consent to treatment form.

CREATE TABLE assessment_patient_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    right_to_withdraw_explained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (right_to_withdraw_explained IN ('yes', 'no', '')),
    right_to_second_opinion_explained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (right_to_second_opinion_explained IN ('yes', 'no', '')),
    confidentiality_explained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (confidentiality_explained IN ('yes', 'no', '')),
    data_use_explained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (data_use_explained IN ('yes', 'no', '')),
    consent_to_photography VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_to_photography IN ('yes', 'no', 'declined', '')),
    consent_to_teaching VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_to_teaching IN ('yes', 'no', 'declined', '')),
    consent_to_tissue_storage VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_to_tissue_storage IN ('yes', 'no', 'declined', '')),
    advance_directive_in_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_directive_in_place IN ('yes', 'no', '')),
    advance_directive_details TEXT NOT NULL DEFAULT '',
    lasting_power_of_attorney VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lasting_power_of_attorney IN ('yes', 'no', '')),
    lpa_details TEXT NOT NULL DEFAULT '',
    patient_rights_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_patient_rights_updated_at
    BEFORE UPDATE ON assessment_patient_rights
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_rights IS
    'Patient rights section: right to withdraw, second opinion, confidentiality, consent for extras. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_patient_rights.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_patient_rights.right_to_withdraw_explained IS
    'Whether the right to withdraw consent at any time was explained: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.right_to_second_opinion_explained IS
    'Whether the right to seek a second opinion was explained: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.confidentiality_explained IS
    'Whether confidentiality was explained: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.data_use_explained IS
    'Whether the use of personal data was explained: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.consent_to_photography IS
    'Whether the patient consents to clinical photography: yes, no, declined, or empty.';
COMMENT ON COLUMN assessment_patient_rights.consent_to_teaching IS
    'Whether the patient consents to presence of students/trainees: yes, no, declined, or empty.';
COMMENT ON COLUMN assessment_patient_rights.consent_to_tissue_storage IS
    'Whether the patient consents to tissue storage for research: yes, no, declined, or empty.';
COMMENT ON COLUMN assessment_patient_rights.advance_directive_in_place IS
    'Whether the patient has an advance directive or living will: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.advance_directive_details IS
    'Details of the advance directive.';
COMMENT ON COLUMN assessment_patient_rights.lasting_power_of_attorney IS
    'Whether there is a lasting power of attorney for health and welfare: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_rights.lpa_details IS
    'Details of the lasting power of attorney.';
COMMENT ON COLUMN assessment_patient_rights.patient_rights_notes IS
    'Additional clinician notes on patient rights discussion.';

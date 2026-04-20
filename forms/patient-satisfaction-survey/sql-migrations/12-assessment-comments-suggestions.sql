-- 12_assessment_comments_suggestions.sql
-- Comments and suggestions section of the patient satisfaction survey.

CREATE TABLE assessment_comments_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    what_went_well TEXT NOT NULL DEFAULT '',
    what_could_improve TEXT NOT NULL DEFAULT '',
    specific_staff_praise TEXT NOT NULL DEFAULT '',
    complaint_raised VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (complaint_raised IN ('yes', 'no', '')),
    complaint_details TEXT NOT NULL DEFAULT '',
    additional_comments TEXT NOT NULL DEFAULT '',
    consent_to_contact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_to_contact IN ('yes', 'no', '')),
    contact_email VARCHAR(255) NOT NULL DEFAULT '',
    contact_phone VARCHAR(30) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comments_suggestions_updated_at
    BEFORE UPDATE ON assessment_comments_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comments_suggestions IS
    'Comments and suggestions section: free-text feedback, praise, complaints, and contact consent. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comments_suggestions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comments_suggestions.what_went_well IS
    'Free-text description of positive aspects of the visit.';
COMMENT ON COLUMN assessment_comments_suggestions.what_could_improve IS
    'Free-text description of areas for improvement.';
COMMENT ON COLUMN assessment_comments_suggestions.specific_staff_praise IS
    'Praise for specific staff members.';
COMMENT ON COLUMN assessment_comments_suggestions.complaint_raised IS
    'Whether the patient wishes to raise a formal complaint: yes, no, or empty.';
COMMENT ON COLUMN assessment_comments_suggestions.complaint_details IS
    'Details of the formal complaint if applicable.';
COMMENT ON COLUMN assessment_comments_suggestions.additional_comments IS
    'Any additional comments or suggestions.';
COMMENT ON COLUMN assessment_comments_suggestions.consent_to_contact IS
    'Whether the patient consents to follow-up contact: yes, no, or empty.';
COMMENT ON COLUMN assessment_comments_suggestions.contact_email IS
    'Email address for follow-up contact.';
COMMENT ON COLUMN assessment_comments_suggestions.contact_phone IS
    'Phone number for follow-up contact.';

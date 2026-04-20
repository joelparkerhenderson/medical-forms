-- 12_assessment_sign_off_compliance.sql
-- Sign-off and compliance section of the onboarding assessment.

CREATE TABLE assessment_sign_off_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    confidentiality_agreement_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (confidentiality_agreement_signed IN ('yes', 'no', '')),
    code_of_conduct_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (code_of_conduct_signed IN ('yes', 'no', '')),
    social_media_policy_acknowledged VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_media_policy_acknowledged IN ('yes', 'no', '')),
    it_acceptable_use_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (it_acceptable_use_signed IN ('yes', 'no', '')),
    gdpr_training_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gdpr_training_completed IN ('yes', 'no', '')),
    duty_of_candour_briefed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (duty_of_candour_briefed IN ('yes', 'no', '')),
    whistleblowing_policy_briefed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (whistleblowing_policy_briefed IN ('yes', 'no', '')),
    employee_signed_off VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (employee_signed_off IN ('yes', 'no', '')),
    employee_sign_off_date DATE,
    manager_signed_off VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (manager_signed_off IN ('yes', 'no', '')),
    manager_sign_off_date DATE,
    manager_sign_off_name VARCHAR(255) NOT NULL DEFAULT '',
    sign_off_compliance_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sign_off_compliance_updated_at
    BEFORE UPDATE ON assessment_sign_off_compliance
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sign_off_compliance IS
    'Sign-off and compliance section: agreements, policies, GDPR, and final sign-off. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sign_off_compliance.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sign_off_compliance.confidentiality_agreement_signed IS
    'Whether the confidentiality agreement has been signed: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.code_of_conduct_signed IS
    'Whether the code of conduct has been signed: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.social_media_policy_acknowledged IS
    'Whether the social media policy has been acknowledged: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.it_acceptable_use_signed IS
    'Whether the IT acceptable use policy has been signed: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.gdpr_training_completed IS
    'Whether GDPR training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.duty_of_candour_briefed IS
    'Whether the employee has been briefed on duty of candour: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.whistleblowing_policy_briefed IS
    'Whether the employee has been briefed on the whistleblowing policy: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.employee_signed_off IS
    'Whether the employee has signed off the onboarding: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.employee_sign_off_date IS
    'Date the employee signed off.';
COMMENT ON COLUMN assessment_sign_off_compliance.manager_signed_off IS
    'Whether the line manager has signed off the onboarding: yes, no, or empty.';
COMMENT ON COLUMN assessment_sign_off_compliance.manager_sign_off_date IS
    'Date the manager signed off.';
COMMENT ON COLUMN assessment_sign_off_compliance.manager_sign_off_name IS
    'Name of the signing-off manager.';
COMMENT ON COLUMN assessment_sign_off_compliance.sign_off_compliance_notes IS
    'Additional notes on sign-off and compliance.';

-- 04_assessment_pre_employment_checks.sql
-- Pre-employment checks section of the onboarding assessment.

CREATE TABLE assessment_pre_employment_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    dbs_check_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dbs_check_status IN ('not-started', 'applied', 'received', 'cleared', '')),
    dbs_certificate_number VARCHAR(50) NOT NULL DEFAULT '',
    dbs_check_date DATE,
    dbs_update_service_registered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dbs_update_service_registered IN ('yes', 'no', '')),
    right_to_work_verified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (right_to_work_verified IN ('yes', 'no', '')),
    right_to_work_document_type VARCHAR(50) NOT NULL DEFAULT '',
    right_to_work_expiry_date DATE,
    references_received INTEGER
        CHECK (references_received IS NULL OR (references_received >= 0 AND references_received <= 10)),
    references_required INTEGER
        CHECK (references_required IS NULL OR (references_required >= 0 AND references_required <= 10)),
    references_satisfactory VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (references_satisfactory IN ('yes', 'no', '')),
    identity_verified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (identity_verified IN ('yes', 'no', '')),
    pre_employment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_pre_employment_checks_updated_at
    BEFORE UPDATE ON assessment_pre_employment_checks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pre_employment_checks IS
    'Pre-employment checks section: DBS, right to work, references, identity verification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_pre_employment_checks.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_pre_employment_checks.dbs_check_status IS
    'DBS check status: not-started, applied, received, cleared, or empty.';
COMMENT ON COLUMN assessment_pre_employment_checks.dbs_certificate_number IS
    'DBS certificate number once received.';
COMMENT ON COLUMN assessment_pre_employment_checks.dbs_check_date IS
    'Date the DBS check was completed.';
COMMENT ON COLUMN assessment_pre_employment_checks.dbs_update_service_registered IS
    'Whether the employee is registered with DBS Update Service: yes, no, or empty.';
COMMENT ON COLUMN assessment_pre_employment_checks.right_to_work_verified IS
    'Whether right to work in the UK has been verified: yes, no, or empty.';
COMMENT ON COLUMN assessment_pre_employment_checks.right_to_work_document_type IS
    'Type of document used to verify right to work.';
COMMENT ON COLUMN assessment_pre_employment_checks.right_to_work_expiry_date IS
    'Expiry date of the right to work document, if applicable.';
COMMENT ON COLUMN assessment_pre_employment_checks.references_received IS
    'Number of references received.';
COMMENT ON COLUMN assessment_pre_employment_checks.references_required IS
    'Number of references required.';
COMMENT ON COLUMN assessment_pre_employment_checks.references_satisfactory IS
    'Whether all references are satisfactory: yes, no, or empty.';
COMMENT ON COLUMN assessment_pre_employment_checks.identity_verified IS
    'Whether identity has been verified with photo ID: yes, no, or empty.';
COMMENT ON COLUMN assessment_pre_employment_checks.pre_employment_notes IS
    'Additional notes on pre-employment checks.';

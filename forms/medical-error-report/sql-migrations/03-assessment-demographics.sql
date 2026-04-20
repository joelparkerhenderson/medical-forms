-- 03_assessment_demographics.sql
-- Demographics section: reporter information for the medical error report.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reporter_first_name VARCHAR(255) NOT NULL DEFAULT '',
    reporter_last_name VARCHAR(255) NOT NULL DEFAULT '',
    reporter_role VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (reporter_role IN ('doctor', 'nurse', 'pharmacist', 'allied-health', 'administrator', 'patient', 'other', '')),
    reporter_department VARCHAR(255) NOT NULL DEFAULT '',
    reporter_contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    reporter_contact_email VARCHAR(255) NOT NULL DEFAULT '',
    facility_name VARCHAR(255) NOT NULL DEFAULT '',
    facility_ward VARCHAR(255) NOT NULL DEFAULT '',
    report_date DATE,
    anonymous_report VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anonymous_report IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: reporter identity, department, facility, and contact details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.reporter_first_name IS
    'First name of the person reporting the error.';
COMMENT ON COLUMN assessment_demographics.reporter_last_name IS
    'Last name of the person reporting the error.';
COMMENT ON COLUMN assessment_demographics.reporter_role IS
    'Professional role of the reporter: doctor, nurse, pharmacist, allied-health, administrator, patient, other, or empty.';
COMMENT ON COLUMN assessment_demographics.reporter_department IS
    'Department where the reporter works.';
COMMENT ON COLUMN assessment_demographics.reporter_contact_phone IS
    'Reporter phone number for follow-up.';
COMMENT ON COLUMN assessment_demographics.reporter_contact_email IS
    'Reporter email address for follow-up.';
COMMENT ON COLUMN assessment_demographics.facility_name IS
    'Name of the healthcare facility where the error occurred.';
COMMENT ON COLUMN assessment_demographics.facility_ward IS
    'Ward or unit where the error occurred.';
COMMENT ON COLUMN assessment_demographics.report_date IS
    'Date the report was filed.';
COMMENT ON COLUMN assessment_demographics.anonymous_report IS
    'Whether the reporter wishes to remain anonymous: yes, no, or empty.';

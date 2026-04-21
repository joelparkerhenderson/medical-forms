-- 03-assessment-clinician.sql
-- Step 1: clinician identification for audit trail and sign-off.

CREATE TABLE assessment_clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    clinician_role VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (clinician_role IN (
            'anaesthetist',
            'surgeon',
            'preop-nurse',
            'perioperative-physician',
            'geriatrician',
            'pharmacist',
            'other',
            ''
        )),
    registration_body VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (registration_body IN ('GMC', 'NMC', 'HCPC', 'GPhC', 'other', '')),
    registration_number VARCHAR(50) NOT NULL DEFAULT '',
    site_name VARCHAR(255) NOT NULL DEFAULT '',
    assessment_date DATE,
    assessment_time TIME,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_clinician_updated_at
    BEFORE UPDATE ON assessment_clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinician IS
    'Step 1: identity of the clinician completing the pre-operative assessment.';
COMMENT ON COLUMN assessment_clinician.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_clinician.clinician_name IS
    'Full name of the clinician.';
COMMENT ON COLUMN assessment_clinician.clinician_role IS
    'Role: anaesthetist, surgeon, preop-nurse, perioperative-physician, geriatrician, pharmacist, other.';
COMMENT ON COLUMN assessment_clinician.registration_body IS
    'Professional registration body: GMC, NMC, HCPC, GPhC, other.';
COMMENT ON COLUMN assessment_clinician.registration_number IS
    'Registration number with the above body.';
COMMENT ON COLUMN assessment_clinician.site_name IS
    'Hospital or clinic site name where the assessment was performed.';
COMMENT ON COLUMN assessment_clinician.assessment_date IS
    'Date the assessment was performed.';
COMMENT ON COLUMN assessment_clinician.assessment_time IS
    'Time the assessment was performed.';

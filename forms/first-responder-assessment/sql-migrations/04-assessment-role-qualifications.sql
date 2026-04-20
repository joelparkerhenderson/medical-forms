-- 04_assessment_role_qualifications.sql
-- Role and qualifications section of the first responder assessment.

CREATE TABLE assessment_role_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    role_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (role_type IN ('paramedic', 'emt', 'first-aider', 'advanced-paramedic', 'community-responder', 'other', '')),
    role_type_other TEXT NOT NULL DEFAULT '',
    employer_organisation VARCHAR(255) NOT NULL DEFAULT '',
    station_base VARCHAR(255) NOT NULL DEFAULT '',
    years_of_service NUMERIC(4,1),
    registration_number VARCHAR(100) NOT NULL DEFAULT '',
    registration_body VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (registration_body IN ('hcpc', 'jrcalc', 'other', '')),
    registration_expiry_date DATE,
    highest_qualification VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (highest_qualification IN ('certificate', 'diploma', 'foundation-degree', 'bachelors', 'masters', 'doctorate', 'other', '')),
    qualification_details TEXT NOT NULL DEFAULT '',
    driving_licence_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_licence_category IN ('c1', 'c1e', 'c', 'ce', 'b', 'none', '')),
    blue_light_trained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (blue_light_trained IN ('yes', 'no', '')),
    role_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_role_qualifications_updated_at
    BEFORE UPDATE ON assessment_role_qualifications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_role_qualifications IS
    'Role and qualifications section: job role, registration, qualifications, and driving competency. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_role_qualifications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_role_qualifications.role_type IS
    'Role type: paramedic, emt, first-aider, advanced-paramedic, community-responder, other, or empty.';
COMMENT ON COLUMN assessment_role_qualifications.employer_organisation IS
    'Name of the employing ambulance service or organisation.';
COMMENT ON COLUMN assessment_role_qualifications.station_base IS
    'Station or base location.';
COMMENT ON COLUMN assessment_role_qualifications.years_of_service IS
    'Total years of service in the role.';
COMMENT ON COLUMN assessment_role_qualifications.registration_number IS
    'Professional registration number.';
COMMENT ON COLUMN assessment_role_qualifications.registration_body IS
    'Registration body: hcpc, jrcalc, other, or empty.';
COMMENT ON COLUMN assessment_role_qualifications.registration_expiry_date IS
    'Date the professional registration expires.';
COMMENT ON COLUMN assessment_role_qualifications.highest_qualification IS
    'Highest relevant qualification level.';
COMMENT ON COLUMN assessment_role_qualifications.qualification_details IS
    'Details of qualifications held.';
COMMENT ON COLUMN assessment_role_qualifications.driving_licence_category IS
    'Driving licence category: c1, c1e, c, ce, b, none, or empty.';
COMMENT ON COLUMN assessment_role_qualifications.blue_light_trained IS
    'Whether blue light (emergency) driving trained: yes, no, or empty.';
COMMENT ON COLUMN assessment_role_qualifications.role_notes IS
    'Additional notes on role and qualifications.';

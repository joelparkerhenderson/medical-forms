-- 06_assessment_occupational_vaccines.sql
-- Occupational vaccines section of the vaccinations checklist.

CREATE TABLE assessment_occupational_vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hepatitis_b_course VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_course IN ('yes', 'no', 'unknown', '')),
    hepatitis_b_course_date DATE,
    hepatitis_b_doses_received INTEGER
        CHECK (hepatitis_b_doses_received IS NULL OR (hepatitis_b_doses_received >= 0 AND hepatitis_b_doses_received <= 4)),
    hepatitis_b_antibody_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_antibody_level IN ('adequate', 'inadequate', 'not-tested', '')),
    bcg_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bcg_vaccine IN ('yes', 'no', 'unknown', '')),
    bcg_vaccine_date DATE,
    bcg_scar_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bcg_scar_present IN ('yes', 'no', '')),
    varicella_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (varicella_vaccine IN ('yes', 'no', 'unknown', '')),
    varicella_vaccine_date DATE,
    varicella_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (varicella_history IN ('yes', 'no', 'unknown', '')),
    hepatitis_a_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_a_vaccine IN ('yes', 'no', 'unknown', '')),
    hepatitis_a_vaccine_date DATE,
    typhoid_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (typhoid_vaccine IN ('yes', 'no', 'unknown', '')),
    typhoid_vaccine_date DATE,
    rabies_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rabies_vaccine IN ('yes', 'no', 'unknown', '')),
    rabies_vaccine_date DATE,
    occupational_vaccines_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_occupational_vaccines_updated_at
    BEFORE UPDATE ON assessment_occupational_vaccines
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_occupational_vaccines IS
    'Occupational vaccines section: Hepatitis B, BCG, varicella, Hepatitis A, typhoid, rabies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_occupational_vaccines.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_b_course IS
    'Whether Hepatitis B course is complete: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_b_course_date IS
    'Date Hepatitis B course was completed.';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_b_doses_received IS
    'Number of Hepatitis B doses received (0-4).';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_b_antibody_level IS
    'Hepatitis B surface antibody level: adequate (>10 mIU/mL), inadequate, not-tested, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.bcg_vaccine IS
    'Whether BCG vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.bcg_vaccine_date IS
    'Date BCG vaccine was administered.';
COMMENT ON COLUMN assessment_occupational_vaccines.bcg_scar_present IS
    'Whether BCG scar is present on examination: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.varicella_vaccine IS
    'Whether varicella vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.varicella_vaccine_date IS
    'Date varicella vaccine was administered.';
COMMENT ON COLUMN assessment_occupational_vaccines.varicella_history IS
    'Whether the patient has a confirmed history of chickenpox: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_a_vaccine IS
    'Whether Hepatitis A vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.hepatitis_a_vaccine_date IS
    'Date Hepatitis A vaccine was administered.';
COMMENT ON COLUMN assessment_occupational_vaccines.typhoid_vaccine IS
    'Whether typhoid vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.typhoid_vaccine_date IS
    'Date typhoid vaccine was administered.';
COMMENT ON COLUMN assessment_occupational_vaccines.rabies_vaccine IS
    'Whether rabies pre-exposure vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_vaccines.rabies_vaccine_date IS
    'Date rabies vaccine was administered.';
COMMENT ON COLUMN assessment_occupational_vaccines.occupational_vaccines_notes IS
    'Additional notes on occupational vaccines.';

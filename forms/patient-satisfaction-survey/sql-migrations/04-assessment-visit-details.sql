-- 04_assessment_visit_details.sql
-- Visit details section of the patient satisfaction survey.

CREATE TABLE assessment_visit_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    visit_date DATE,
    visit_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (visit_type IN ('outpatient', 'inpatient', 'day-case', 'emergency', 'telehealth', 'home-visit', '')),
    department VARCHAR(255) NOT NULL DEFAULT '',
    hospital_site VARCHAR(255) NOT NULL DEFAULT '',
    length_of_stay_days INTEGER
        CHECK (length_of_stay_days IS NULL OR length_of_stay_days >= 0),
    referral_source VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (referral_source IN ('gp', 'self', 'emergency', 'another-hospital', 'specialist', '')),
    is_first_visit VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (is_first_visit IN ('yes', 'no', '')),
    visit_details_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_visit_details_updated_at
    BEFORE UPDATE ON assessment_visit_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_visit_details IS
    'Visit details section: date, type, department, and referral source. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_visit_details.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_visit_details.visit_date IS
    'Date of the visit being evaluated.';
COMMENT ON COLUMN assessment_visit_details.visit_type IS
    'Type of visit: outpatient, inpatient, day-case, emergency, telehealth, home-visit, or empty.';
COMMENT ON COLUMN assessment_visit_details.department IS
    'Department or clinic attended.';
COMMENT ON COLUMN assessment_visit_details.hospital_site IS
    'Hospital or clinic site name.';
COMMENT ON COLUMN assessment_visit_details.length_of_stay_days IS
    'Length of stay in days for inpatient visits.';
COMMENT ON COLUMN assessment_visit_details.referral_source IS
    'Source of referral: gp, self, emergency, another-hospital, specialist, or empty.';
COMMENT ON COLUMN assessment_visit_details.is_first_visit IS
    'Whether this was the first visit to this department: yes, no, or empty.';
COMMENT ON COLUMN assessment_visit_details.visit_details_notes IS
    'Additional notes about the visit.';

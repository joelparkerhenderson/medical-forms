-- 03_assessment_pregnancy_details.sql
-- Pregnancy details section of the prenatal assessment.

CREATE TABLE assessment_pregnancy_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    estimated_due_date DATE,
    gestational_age_weeks INTEGER
        CHECK (gestational_age_weeks IS NULL OR (gestational_age_weeks >= 0 AND gestational_age_weeks <= 45)),
    gestational_age_days INTEGER
        CHECK (gestational_age_days IS NULL OR (gestational_age_days >= 0 AND gestational_age_days <= 6)),
    dating_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (dating_method IN ('lmp', 'ultrasound', 'ivf', 'unknown', '')),
    last_menstrual_period DATE,
    pregnancy_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pregnancy_type IN ('singleton', 'twins', 'triplets', 'higher-order', '')),
    conception_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (conception_method IN ('natural', 'ivf', 'iui', 'icsi', 'other', '')),
    planned_pregnancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (planned_pregnancy IN ('yes', 'no', '')),
    booking_visit_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (booking_visit_completed IN ('yes', 'no', '')),
    booking_visit_date DATE,
    blood_group VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '')),
    rhesus_status VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (rhesus_status IN ('positive', 'negative', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_pregnancy_details_updated_at
    BEFORE UPDATE ON assessment_pregnancy_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pregnancy_details IS
    'Pregnancy details section: gestational dating, pregnancy type, conception method, and blood group. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_pregnancy_details.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_pregnancy_details.estimated_due_date IS
    'Estimated date of delivery (EDD).';
COMMENT ON COLUMN assessment_pregnancy_details.gestational_age_weeks IS
    'Current gestational age in completed weeks.';
COMMENT ON COLUMN assessment_pregnancy_details.gestational_age_days IS
    'Additional days beyond completed weeks of gestation (0-6).';
COMMENT ON COLUMN assessment_pregnancy_details.dating_method IS
    'Method used to determine gestational age: lmp, ultrasound, ivf, unknown, or empty.';
COMMENT ON COLUMN assessment_pregnancy_details.last_menstrual_period IS
    'Date of last menstrual period.';
COMMENT ON COLUMN assessment_pregnancy_details.pregnancy_type IS
    'Pregnancy plurality: singleton, twins, triplets, higher-order, or empty.';
COMMENT ON COLUMN assessment_pregnancy_details.conception_method IS
    'Method of conception: natural, ivf, iui, icsi, other, or empty.';
COMMENT ON COLUMN assessment_pregnancy_details.planned_pregnancy IS
    'Whether the pregnancy was planned.';
COMMENT ON COLUMN assessment_pregnancy_details.blood_group IS
    'Maternal blood group and Rh type.';
COMMENT ON COLUMN assessment_pregnancy_details.rhesus_status IS
    'Rhesus (Rh) D status: positive, negative, or empty.';

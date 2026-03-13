-- 06_assessment_exacerbation_history.sql
-- Exacerbation history section of the pulmonology assessment.

CREATE TABLE assessment_exacerbation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    exacerbations_past_year INTEGER
        CHECK (exacerbations_past_year IS NULL OR exacerbations_past_year >= 0),
    hospitalisations_past_year INTEGER
        CHECK (hospitalisations_past_year IS NULL OR hospitalisations_past_year >= 0),
    icu_admissions_past_year INTEGER
        CHECK (icu_admissions_past_year IS NULL OR icu_admissions_past_year >= 0),
    intubation_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intubation_history IN ('yes', 'no', '')),
    niv_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (niv_history IN ('yes', 'no', '')),
    oral_steroid_courses_past_year INTEGER
        CHECK (oral_steroid_courses_past_year IS NULL OR oral_steroid_courses_past_year >= 0),
    antibiotic_courses_past_year INTEGER
        CHECK (antibiotic_courses_past_year IS NULL OR antibiotic_courses_past_year >= 0),
    last_exacerbation_date DATE,
    last_exacerbation_trigger TEXT NOT NULL DEFAULT '',
    seasonal_pattern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seasonal_pattern IN ('yes', 'no', '')),
    seasonal_details TEXT NOT NULL DEFAULT '',
    pneumonia_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pneumonia_history IN ('yes', 'no', '')),
    pneumonia_count INTEGER
        CHECK (pneumonia_count IS NULL OR pneumonia_count >= 0),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_exacerbation_history_updated_at
    BEFORE UPDATE ON assessment_exacerbation_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_exacerbation_history IS
    'Exacerbation history section: frequency of exacerbations, hospitalisations, ICU admissions, steroid/antibiotic courses, and triggers. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_exacerbation_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_exacerbation_history.exacerbations_past_year IS
    'Number of exacerbations in the past 12 months.';
COMMENT ON COLUMN assessment_exacerbation_history.hospitalisations_past_year IS
    'Number of hospitalisations for exacerbations in the past 12 months.';
COMMENT ON COLUMN assessment_exacerbation_history.icu_admissions_past_year IS
    'Number of ICU admissions in the past 12 months.';
COMMENT ON COLUMN assessment_exacerbation_history.intubation_history IS
    'Whether the patient has ever been intubated for respiratory failure.';
COMMENT ON COLUMN assessment_exacerbation_history.niv_history IS
    'Whether the patient has used non-invasive ventilation (NIV/BiPAP/CPAP).';
COMMENT ON COLUMN assessment_exacerbation_history.oral_steroid_courses_past_year IS
    'Number of oral corticosteroid courses in the past 12 months.';
COMMENT ON COLUMN assessment_exacerbation_history.antibiotic_courses_past_year IS
    'Number of antibiotic courses for respiratory infections in the past 12 months.';
COMMENT ON COLUMN assessment_exacerbation_history.seasonal_pattern IS
    'Whether exacerbations follow a seasonal pattern.';
COMMENT ON COLUMN assessment_exacerbation_history.pneumonia_history IS
    'Whether the patient has had pneumonia.';

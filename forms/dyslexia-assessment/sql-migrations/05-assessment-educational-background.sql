-- 05_assessment_educational_background.sql
-- Educational background section of the dyslexia assessment.

CREATE TABLE assessment_educational_background (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_education_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (current_education_level IN ('primary', 'secondary', 'further-education', 'higher-education', 'adult', '')),
    school_name VARCHAR(255) NOT NULL DEFAULT '',
    year_group VARCHAR(50) NOT NULL DEFAULT '',
    previous_schools_count INTEGER
        CHECK (previous_schools_count IS NULL OR previous_schools_count >= 0),
    school_attendance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (school_attendance IN ('regular', 'irregular', 'school-refusal', '')),
    academic_performance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (academic_performance IN ('above-average', 'average', 'below-average', 'significantly-below', '')),
    english_as_additional_language VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (english_as_additional_language IN ('yes', 'no', '')),
    additional_languages TEXT NOT NULL DEFAULT '',
    sen_register VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sen_register IN ('yes', 'no', '')),
    ehcp VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ehcp IN ('yes', 'no', '')),
    ehcp_details TEXT NOT NULL DEFAULT '',
    educational_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_educational_background_updated_at
    BEFORE UPDATE ON assessment_educational_background
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_educational_background IS
    'Educational background section: school, attendance, performance, SEN status, EHCP. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_educational_background.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_educational_background.current_education_level IS
    'Current education level: primary, secondary, further-education, higher-education, adult, or empty.';
COMMENT ON COLUMN assessment_educational_background.school_name IS
    'Name of the current school or educational institution.';
COMMENT ON COLUMN assessment_educational_background.year_group IS
    'Current year group or course.';
COMMENT ON COLUMN assessment_educational_background.previous_schools_count IS
    'Number of previous schools attended.';
COMMENT ON COLUMN assessment_educational_background.school_attendance IS
    'School attendance pattern: regular, irregular, school-refusal, or empty.';
COMMENT ON COLUMN assessment_educational_background.academic_performance IS
    'Overall academic performance level: above-average, average, below-average, significantly-below, or empty.';
COMMENT ON COLUMN assessment_educational_background.english_as_additional_language IS
    'Whether English is an additional language: yes, no, or empty.';
COMMENT ON COLUMN assessment_educational_background.additional_languages IS
    'Other languages spoken.';
COMMENT ON COLUMN assessment_educational_background.sen_register IS
    'Whether on the Special Educational Needs register: yes, no, or empty.';
COMMENT ON COLUMN assessment_educational_background.ehcp IS
    'Whether the patient has an Education, Health and Care Plan: yes, no, or empty.';
COMMENT ON COLUMN assessment_educational_background.ehcp_details IS
    'Details of EHCP if present.';
COMMENT ON COLUMN assessment_educational_background.educational_notes IS
    'Additional clinician notes on educational background.';

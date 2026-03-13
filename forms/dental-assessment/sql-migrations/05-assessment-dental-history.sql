-- 05_assessment_dental_history.sql
-- Step 3: Dental history section of the dental assessment.

CREATE TABLE assessment_dental_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    last_dental_visit DATE,
    visit_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (visit_frequency IN ('every_6_months', 'annually', 'every_2_years', 'rarely', 'never', '')),
    previous_extractions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_extractions IN ('yes', 'no', '')),
    extraction_details TEXT NOT NULL DEFAULT '',
    previous_orthodontics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_orthodontics IN ('yes', 'no', '')),
    orthodontic_details TEXT NOT NULL DEFAULT '',
    previous_endodontics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_endodontics IN ('yes', 'no', '')),
    endodontic_details TEXT NOT NULL DEFAULT '',
    previous_prosthetics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_prosthetics IN ('yes', 'no', '')),
    prosthetic_details TEXT NOT NULL DEFAULT '',
    oral_hygiene_routine TEXT NOT NULL DEFAULT '',
    brushing_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (brushing_frequency IN ('twice_daily', 'once_daily', 'less_than_daily', '')),
    flossing_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (flossing_frequency IN ('daily', 'weekly', 'rarely', 'never', '')),
    mouthwash_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mouthwash_use IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dental_history_updated_at
    BEFORE UPDATE ON assessment_dental_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dental_history IS
    'Step 3 Dental History: past treatments, visit frequency, and oral hygiene habits. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dental_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dental_history.last_dental_visit IS
    'Date of the most recent dental visit, NULL if unanswered.';
COMMENT ON COLUMN assessment_dental_history.visit_frequency IS
    'How often the patient typically visits the dentist.';
COMMENT ON COLUMN assessment_dental_history.previous_extractions IS
    'Whether the patient has had previous tooth extractions.';
COMMENT ON COLUMN assessment_dental_history.extraction_details IS
    'Details of previous extractions including teeth and dates.';
COMMENT ON COLUMN assessment_dental_history.previous_orthodontics IS
    'Whether the patient has had orthodontic treatment.';
COMMENT ON COLUMN assessment_dental_history.orthodontic_details IS
    'Details of orthodontic history.';
COMMENT ON COLUMN assessment_dental_history.previous_endodontics IS
    'Whether the patient has had root canal treatment.';
COMMENT ON COLUMN assessment_dental_history.endodontic_details IS
    'Details of endodontic treatment history.';
COMMENT ON COLUMN assessment_dental_history.previous_prosthetics IS
    'Whether the patient has crowns, bridges, or dentures.';
COMMENT ON COLUMN assessment_dental_history.prosthetic_details IS
    'Details of prosthetic dental work.';
COMMENT ON COLUMN assessment_dental_history.oral_hygiene_routine IS
    'Free-text description of daily oral hygiene routine.';
COMMENT ON COLUMN assessment_dental_history.brushing_frequency IS
    'How often the patient brushes teeth.';
COMMENT ON COLUMN assessment_dental_history.flossing_frequency IS
    'How often the patient flosses.';
COMMENT ON COLUMN assessment_dental_history.mouthwash_use IS
    'Whether the patient uses mouthwash regularly.';

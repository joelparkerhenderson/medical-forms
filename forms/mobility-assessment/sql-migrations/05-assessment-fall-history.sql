-- 05_assessment_fall_history.sql
-- Fall history section of the mobility assessment.

CREATE TABLE assessment_fall_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    falls_in_past_12_months VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (falls_in_past_12_months IN ('yes', 'no', '')),
    fall_count INTEGER
        CHECK (fall_count IS NULL OR fall_count >= 0),
    most_recent_fall_date DATE,
    fall_circumstances TEXT NOT NULL DEFAULT '',
    fall_injuries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fall_injuries IN ('yes', 'no', '')),
    fall_injury_details TEXT NOT NULL DEFAULT '',
    fracture_from_fall VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fracture_from_fall IN ('yes', 'no', '')),
    fracture_details TEXT NOT NULL DEFAULT '',
    hospitalisation_from_fall VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hospitalisation_from_fall IN ('yes', 'no', '')),
    fear_of_falling VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fear_of_falling IN ('none', 'mild', 'moderate', 'severe', '')),
    activity_restriction_due_to_fear VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (activity_restriction_due_to_fear IN ('yes', 'no', '')),
    near_falls VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (near_falls IN ('yes', 'no', '')),
    near_fall_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (near_fall_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    fall_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_fall_history_updated_at
    BEFORE UPDATE ON assessment_fall_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_fall_history IS
    'Fall history section: recent falls, injuries, fractures, and fear of falling. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_fall_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_fall_history.falls_in_past_12_months IS
    'Whether the patient has had falls in the past 12 months: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.fall_count IS
    'Number of falls in the past 12 months.';
COMMENT ON COLUMN assessment_fall_history.most_recent_fall_date IS
    'Date of the most recent fall.';
COMMENT ON COLUMN assessment_fall_history.fall_circumstances IS
    'Free-text description of circumstances surrounding falls.';
COMMENT ON COLUMN assessment_fall_history.fall_injuries IS
    'Whether falls resulted in injuries: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.fall_injury_details IS
    'Free-text details of fall-related injuries.';
COMMENT ON COLUMN assessment_fall_history.fracture_from_fall IS
    'Whether falls resulted in fractures: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.fracture_details IS
    'Free-text details of fall-related fractures.';
COMMENT ON COLUMN assessment_fall_history.hospitalisation_from_fall IS
    'Whether falls required hospitalisation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.fear_of_falling IS
    'Level of fear of falling: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_fall_history.activity_restriction_due_to_fear IS
    'Whether the patient restricts activities due to fear of falling: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.near_falls IS
    'Whether the patient experiences near-falls: yes, no, or empty string.';
COMMENT ON COLUMN assessment_fall_history.near_fall_frequency IS
    'How often near-falls occur: daily, weekly, monthly, rarely, or empty string.';
COMMENT ON COLUMN assessment_fall_history.fall_history_notes IS
    'Free-text clinician notes on fall history.';

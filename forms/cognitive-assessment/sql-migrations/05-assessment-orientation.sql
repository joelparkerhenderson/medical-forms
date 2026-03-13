-- 05_assessment_orientation.sql
-- Orientation (time and place) section of the cognitive assessment (MMSE items 1-10).

CREATE TABLE assessment_orientation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Orientation to time (5 points)
    orientation_year VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_year IN ('correct', 'incorrect', '')),
    orientation_season VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_season IN ('correct', 'incorrect', '')),
    orientation_month VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_month IN ('correct', 'incorrect', '')),
    orientation_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_date IN ('correct', 'incorrect', '')),
    orientation_day VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_day IN ('correct', 'incorrect', '')),
    orientation_time_score INTEGER
        CHECK (orientation_time_score IS NULL OR (orientation_time_score >= 0 AND orientation_time_score <= 5)),

    -- Orientation to place (5 points)
    orientation_country VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_country IN ('correct', 'incorrect', '')),
    orientation_county VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_county IN ('correct', 'incorrect', '')),
    orientation_city VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_city IN ('correct', 'incorrect', '')),
    orientation_building VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_building IN ('correct', 'incorrect', '')),
    orientation_floor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_floor IN ('correct', 'incorrect', '')),
    orientation_place_score INTEGER
        CHECK (orientation_place_score IS NULL OR (orientation_place_score >= 0 AND orientation_place_score <= 5)),

    orientation_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_orientation_updated_at
    BEFORE UPDATE ON assessment_orientation
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_orientation IS
    'Orientation section (MMSE items 1-10): orientation to time (5 points) and orientation to place (5 points). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_orientation.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_orientation.orientation_year IS
    'Whether the patient correctly identified the current year: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_orientation.orientation_season IS
    'Whether the patient correctly identified the current season.';
COMMENT ON COLUMN assessment_orientation.orientation_month IS
    'Whether the patient correctly identified the current month.';
COMMENT ON COLUMN assessment_orientation.orientation_date IS
    'Whether the patient correctly identified the date.';
COMMENT ON COLUMN assessment_orientation.orientation_day IS
    'Whether the patient correctly identified the day of the week.';
COMMENT ON COLUMN assessment_orientation.orientation_time_score IS
    'Subtotal score for orientation to time, 0-5.';
COMMENT ON COLUMN assessment_orientation.orientation_country IS
    'Whether the patient correctly identified the country.';
COMMENT ON COLUMN assessment_orientation.orientation_county IS
    'Whether the patient correctly identified the county or region.';
COMMENT ON COLUMN assessment_orientation.orientation_city IS
    'Whether the patient correctly identified the city or town.';
COMMENT ON COLUMN assessment_orientation.orientation_building IS
    'Whether the patient correctly identified the building or hospital.';
COMMENT ON COLUMN assessment_orientation.orientation_floor IS
    'Whether the patient correctly identified the floor or ward.';
COMMENT ON COLUMN assessment_orientation.orientation_place_score IS
    'Subtotal score for orientation to place, 0-5.';
COMMENT ON COLUMN assessment_orientation.orientation_notes IS
    'Additional clinician notes on orientation assessment.';

-- 04_assessment_dyspnoea_assessment.sql
-- Dyspnoea assessment section of the respirology assessment.

CREATE TABLE assessment_dyspnoea_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mrc_dyspnoea_grade INTEGER
        CHECK (mrc_dyspnoea_grade IS NULL OR (mrc_dyspnoea_grade >= 1 AND mrc_dyspnoea_grade <= 5)),
    dyspnoea_at_rest VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspnoea_at_rest IN ('yes', 'no', '')),
    dyspnoea_on_exertion VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspnoea_on_exertion IN ('yes', 'no', '')),
    orthopnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orthopnoea IN ('yes', 'no', '')),
    paroxysmal_nocturnal_dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (paroxysmal_nocturnal_dyspnoea IN ('yes', 'no', '')),
    dyspnoea_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dyspnoea_onset IN ('gradual', 'sudden', 'episodic', '')),
    dyspnoea_triggers TEXT NOT NULL DEFAULT '',
    dyspnoea_relieving_factors TEXT NOT NULL DEFAULT '',
    exercise_limitation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (exercise_limitation IN ('none', 'mild', 'moderate', 'severe', '')),
    walking_distance_metres INTEGER
        CHECK (walking_distance_metres IS NULL OR walking_distance_metres >= 0),
    flights_of_stairs INTEGER
        CHECK (flights_of_stairs IS NULL OR flights_of_stairs >= 0),
    borg_dyspnoea_score INTEGER
        CHECK (borg_dyspnoea_score IS NULL OR (borg_dyspnoea_score >= 0 AND borg_dyspnoea_score <= 10)),
    oxygen_requirement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oxygen_requirement IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dyspnoea_assessment_updated_at
    BEFORE UPDATE ON assessment_dyspnoea_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dyspnoea_assessment IS
    'Dyspnoea assessment section: MRC dyspnoea grade, functional limitation, triggers, and Borg scale. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dyspnoea_assessment.mrc_dyspnoea_grade IS
    'MRC (Medical Research Council) dyspnoea grade: 1=strenuous exercise only, 2=hurrying on flat, 3=slower than peers, 4=stops after 100m, 5=too breathless to leave house.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.dyspnoea_at_rest IS
    'Whether the patient is breathless at rest.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.dyspnoea_on_exertion IS
    'Whether the patient is breathless on exertion.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.orthopnoea IS
    'Whether the patient experiences orthopnoea (breathlessness lying flat).';
COMMENT ON COLUMN assessment_dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea IS
    'Whether the patient wakes at night with breathlessness (PND).';
COMMENT ON COLUMN assessment_dyspnoea_assessment.dyspnoea_onset IS
    'Pattern of dyspnoea onset: gradual, sudden, episodic, or empty.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.exercise_limitation IS
    'Degree of exercise limitation: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.walking_distance_metres IS
    'Maximum walking distance before needing to stop due to breathlessness.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.flights_of_stairs IS
    'Number of flights of stairs patient can manage without stopping.';
COMMENT ON COLUMN assessment_dyspnoea_assessment.borg_dyspnoea_score IS
    'Modified Borg dyspnoea scale score (0=nothing at all, 10=maximal).';
COMMENT ON COLUMN assessment_dyspnoea_assessment.oxygen_requirement IS
    'Whether the patient requires supplemental oxygen.';

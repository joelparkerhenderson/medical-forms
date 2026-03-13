-- 09_assessment_daytime_dysfunction.sql
-- Daytime dysfunction section of the sleep quality assessment (PSQI Component 7).

CREATE TABLE assessment_daytime_dysfunction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI Q8: trouble staying awake
    trouble_staying_awake INTEGER
        CHECK (trouble_staying_awake IS NULL OR (trouble_staying_awake >= 0 AND trouble_staying_awake <= 3)),

    -- PSQI Q9: problem keeping up enthusiasm
    lack_of_enthusiasm INTEGER
        CHECK (lack_of_enthusiasm IS NULL OR (lack_of_enthusiasm >= 0 AND lack_of_enthusiasm <= 3)),

    daytime_sleepiness_severity INTEGER
        CHECK (daytime_sleepiness_severity IS NULL OR (daytime_sleepiness_severity >= 0 AND daytime_sleepiness_severity <= 10)),
    epworth_sleepiness_score INTEGER
        CHECK (epworth_sleepiness_score IS NULL OR (epworth_sleepiness_score >= 0 AND epworth_sleepiness_score <= 24)),
    concentration_difficulty VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (concentration_difficulty IN ('yes', 'no', '')),
    memory_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (memory_problems IN ('yes', 'no', '')),
    irritability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (irritability IN ('yes', 'no', '')),
    morning_headaches VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (morning_headaches IN ('yes', 'no', '')),
    drowsy_driving VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (drowsy_driving IN ('yes', 'no', '')),
    work_performance_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (work_performance_impact IN ('none', 'mild', 'moderate', 'severe', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_daytime_dysfunction_updated_at
    BEFORE UPDATE ON assessment_daytime_dysfunction
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_daytime_dysfunction IS
    'Daytime dysfunction section (PSQI Component 7): daytime sleepiness, cognitive impairment, and functional impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_daytime_dysfunction.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_daytime_dysfunction.trouble_staying_awake IS
    'PSQI Q8: trouble staying awake during activities; 0=not at all, 1=<1/week, 2=1-2/week, 3=>=3/week.';
COMMENT ON COLUMN assessment_daytime_dysfunction.lack_of_enthusiasm IS
    'PSQI Q9: problem keeping up enthusiasm; 0=not at all, 1=only a slight problem, 2=somewhat of a problem, 3=a very big problem.';
COMMENT ON COLUMN assessment_daytime_dysfunction.daytime_sleepiness_severity IS
    'Daytime sleepiness severity on a 0-10 Visual Analogue Scale.';
COMMENT ON COLUMN assessment_daytime_dysfunction.epworth_sleepiness_score IS
    'Epworth Sleepiness Scale score (0-24); >10 indicates excessive daytime sleepiness.';
COMMENT ON COLUMN assessment_daytime_dysfunction.concentration_difficulty IS
    'Whether patient has difficulty concentrating during the day.';
COMMENT ON COLUMN assessment_daytime_dysfunction.memory_problems IS
    'Whether patient has memory problems related to poor sleep.';
COMMENT ON COLUMN assessment_daytime_dysfunction.irritability IS
    'Whether patient experiences irritability related to poor sleep.';
COMMENT ON COLUMN assessment_daytime_dysfunction.morning_headaches IS
    'Whether patient experiences morning headaches (possible sleep apnoea indicator).';
COMMENT ON COLUMN assessment_daytime_dysfunction.drowsy_driving IS
    'Whether patient has experienced drowsy driving (safety concern).';
COMMENT ON COLUMN assessment_daytime_dysfunction.work_performance_impact IS
    'Impact on work performance: none, mild, moderate, severe, or empty string.';

-- 04_assessment_menstrual_history.sql
-- Menstrual history section of the endometriosis assessment.

CREATE TABLE assessment_menstrual_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age_at_menarche INTEGER
        CHECK (age_at_menarche IS NULL OR (age_at_menarche >= 8 AND age_at_menarche <= 20)),
    cycle_regularity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cycle_regularity IN ('regular', 'irregular', 'absent', '')),
    cycle_length_days INTEGER
        CHECK (cycle_length_days IS NULL OR (cycle_length_days >= 14 AND cycle_length_days <= 90)),
    period_duration_days INTEGER
        CHECK (period_duration_days IS NULL OR (period_duration_days >= 1 AND period_duration_days <= 21)),
    flow_heaviness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (flow_heaviness IN ('light', 'moderate', 'heavy', 'very-heavy', '')),
    clots_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clots_present IN ('yes', 'no', '')),
    intermenstrual_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intermenstrual_bleeding IN ('yes', 'no', '')),
    postcoital_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (postcoital_bleeding IN ('yes', 'no', '')),
    dysmenorrhoea_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (dysmenorrhoea_severity IN ('none', 'mild', 'moderate', 'severe', '')),
    days_off_work_per_cycle INTEGER
        CHECK (days_off_work_per_cycle IS NULL OR days_off_work_per_cycle >= 0),
    current_contraception VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (current_contraception IN ('none', 'combined-pill', 'progesterone-only-pill', 'mirena-ius', 'implant', 'injection', 'copper-iud', 'condoms', 'other', '')),
    menstrual_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_menstrual_history_updated_at
    BEFORE UPDATE ON assessment_menstrual_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_menstrual_history IS
    'Menstrual history section: cycle characteristics, dysmenorrhoea severity, contraception. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_menstrual_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_menstrual_history.age_at_menarche IS
    'Age at first menstrual period in years.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_regularity IS
    'Menstrual cycle regularity: regular, irregular, absent, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_length_days IS
    'Average menstrual cycle length in days.';
COMMENT ON COLUMN assessment_menstrual_history.period_duration_days IS
    'Average duration of menstrual period in days.';
COMMENT ON COLUMN assessment_menstrual_history.flow_heaviness IS
    'Menstrual flow heaviness: light, moderate, heavy, very-heavy, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.clots_present IS
    'Whether menstrual clots are present: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.intermenstrual_bleeding IS
    'Whether bleeding occurs between periods: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.postcoital_bleeding IS
    'Whether bleeding occurs after intercourse: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea_severity IS
    'Severity of period pain: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.days_off_work_per_cycle IS
    'Number of days off work or school per menstrual cycle due to symptoms.';
COMMENT ON COLUMN assessment_menstrual_history.current_contraception IS
    'Current contraception method used by the patient.';
COMMENT ON COLUMN assessment_menstrual_history.menstrual_notes IS
    'Additional clinician notes on menstrual history.';

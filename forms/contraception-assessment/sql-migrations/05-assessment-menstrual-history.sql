-- 05_assessment_menstrual_history.sql
-- Menstrual history section of the contraception assessment.

CREATE TABLE assessment_menstrual_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age_at_menarche INTEGER
        CHECK (age_at_menarche IS NULL OR (age_at_menarche >= 8 AND age_at_menarche <= 20)),
    last_menstrual_period DATE,
    cycle_regularity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cycle_regularity IN ('regular', 'irregular', 'amenorrhoea', '')),
    cycle_length_days INTEGER
        CHECK (cycle_length_days IS NULL OR (cycle_length_days >= 14 AND cycle_length_days <= 90)),
    period_duration_days INTEGER
        CHECK (period_duration_days IS NULL OR (period_duration_days >= 1 AND period_duration_days <= 21)),
    flow_heaviness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (flow_heaviness IN ('light', 'moderate', 'heavy', '')),
    intermenstrual_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intermenstrual_bleeding IN ('yes', 'no', '')),
    postcoital_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (postcoital_bleeding IN ('yes', 'no', '')),
    dysmenorrhoea VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (dysmenorrhoea IN ('none', 'mild', 'moderate', 'severe', '')),
    dysmenorrhoea_management TEXT NOT NULL DEFAULT '',
    menstrual_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_menstrual_history_updated_at
    BEFORE UPDATE ON assessment_menstrual_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_menstrual_history IS
    'Menstrual history section: menarche, cycle pattern, flow, bleeding abnormalities, and dysmenorrhoea. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_menstrual_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_menstrual_history.age_at_menarche IS
    'Age at first menstrual period in years.';
COMMENT ON COLUMN assessment_menstrual_history.last_menstrual_period IS
    'Date of the first day of the last menstrual period.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_regularity IS
    'Menstrual cycle regularity: regular, irregular, amenorrhoea, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_length_days IS
    'Typical menstrual cycle length in days.';
COMMENT ON COLUMN assessment_menstrual_history.period_duration_days IS
    'Typical duration of menstrual bleeding in days.';
COMMENT ON COLUMN assessment_menstrual_history.flow_heaviness IS
    'Menstrual flow heaviness: light, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.intermenstrual_bleeding IS
    'Whether intermenstrual bleeding occurs: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.postcoital_bleeding IS
    'Whether postcoital bleeding occurs: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea IS
    'Severity of menstrual pain: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea_management IS
    'Current management of dysmenorrhoea.';
COMMENT ON COLUMN assessment_menstrual_history.menstrual_history_notes IS
    'Additional clinician notes on menstrual history.';

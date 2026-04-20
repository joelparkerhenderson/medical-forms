-- 04_assessment_menstrual_history.sql
-- Menstrual history section of the birth control assessment.

CREATE TABLE assessment_menstrual_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    menarche_age INTEGER
        CHECK (menarche_age IS NULL OR (menarche_age >= 7 AND menarche_age <= 25)),
    cycle_regularity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cycle_regularity IN ('regular', 'irregular', 'absent', '')),
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
    last_menstrual_period DATE,
    amenorrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (amenorrhoea IN ('yes', 'no', '')),
    amenorrhoea_duration_months INTEGER
        CHECK (amenorrhoea_duration_months IS NULL OR amenorrhoea_duration_months >= 0),
    menstrual_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_menstrual_history_updated_at
    BEFORE UPDATE ON assessment_menstrual_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_menstrual_history IS
    'Menstrual history section: cycle regularity, flow, dysmenorrhoea, and amenorrhoea. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_menstrual_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_menstrual_history.menarche_age IS
    'Age at first menstrual period.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_regularity IS
    'Menstrual cycle regularity: regular, irregular, absent, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_length_days IS
    'Typical cycle length in days.';
COMMENT ON COLUMN assessment_menstrual_history.period_duration_days IS
    'Typical period duration in days.';
COMMENT ON COLUMN assessment_menstrual_history.flow_heaviness IS
    'Menstrual flow heaviness: light, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.intermenstrual_bleeding IS
    'Whether the patient has intermenstrual bleeding: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.postcoital_bleeding IS
    'Whether the patient has postcoital bleeding: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea IS
    'Period pain severity: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.last_menstrual_period IS
    'Date of last menstrual period.';
COMMENT ON COLUMN assessment_menstrual_history.amenorrhoea IS
    'Whether the patient has amenorrhoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_menstrual_history.amenorrhoea_duration_months IS
    'Duration of amenorrhoea in months.';
COMMENT ON COLUMN assessment_menstrual_history.menstrual_notes IS
    'Additional clinician notes on menstrual history.';

-- 05_assessment_menstrual_history.sql
-- Menstrual history section of the gynaecology assessment.

CREATE TABLE assessment_menstrual_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    menarche_age INTEGER
        CHECK (menarche_age IS NULL OR (menarche_age >= 8 AND menarche_age <= 20)),
    menstrual_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (menstrual_status IN ('regular', 'irregular', 'amenorrhoea', 'post-menopausal', '')),
    cycle_length_days INTEGER
        CHECK (cycle_length_days IS NULL OR (cycle_length_days >= 14 AND cycle_length_days <= 90)),
    period_duration_days INTEGER
        CHECK (period_duration_days IS NULL OR (period_duration_days >= 1 AND period_duration_days <= 21)),
    flow_volume VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (flow_volume IN ('light', 'normal', 'heavy', '')),
    menorrhagia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (menorrhagia IN ('yes', 'no', '')),
    dysmenorrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dysmenorrhoea IN ('yes', 'no', '')),
    dysmenorrhoea_severity INTEGER
        CHECK (dysmenorrhoea_severity IS NULL OR (dysmenorrhoea_severity >= 1 AND dysmenorrhoea_severity <= 10)),
    intermenstrual_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intermenstrual_bleeding IN ('yes', 'no', '')),
    postcoital_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (postcoital_bleeding IN ('yes', 'no', '')),
    post_menopausal_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (post_menopausal_bleeding IN ('yes', 'no', '')),
    last_menstrual_period_date DATE,
    menopause_age INTEGER
        CHECK (menopause_age IS NULL OR (menopause_age >= 30 AND menopause_age <= 65)),
    menstrual_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_menstrual_history_updated_at
    BEFORE UPDATE ON assessment_menstrual_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_menstrual_history IS
    'Menstrual history section: menarche, cycle regularity, flow, dysmenorrhoea, and abnormal bleeding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_menstrual_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_menstrual_history.menarche_age IS
    'Age at menarche (first period) in years, NULL if unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.menstrual_status IS
    'Current menstrual status: regular, irregular, amenorrhoea, post-menopausal, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.cycle_length_days IS
    'Cycle length in days (first day to first day), NULL if unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.period_duration_days IS
    'Duration of menstrual bleeding in days, NULL if unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.flow_volume IS
    'Menstrual flow volume: light, normal, heavy, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.menorrhagia IS
    'Whether heavy menstrual bleeding (menorrhagia) is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea IS
    'Whether painful periods (dysmenorrhoea) are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.dysmenorrhoea_severity IS
    'Dysmenorrhoea severity from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.intermenstrual_bleeding IS
    'Whether bleeding between periods is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.postcoital_bleeding IS
    'Whether post-coital bleeding is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.post_menopausal_bleeding IS
    'Whether post-menopausal bleeding is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_menstrual_history.last_menstrual_period_date IS
    'Date of last menstrual period, NULL if post-menopausal or unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.menopause_age IS
    'Age at menopause in years, NULL if pre-menopausal or unanswered.';
COMMENT ON COLUMN assessment_menstrual_history.menstrual_notes IS
    'Free-text notes on menstrual history.';

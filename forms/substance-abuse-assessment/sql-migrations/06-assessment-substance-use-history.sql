-- 06_assessment_substance_use_history.sql
-- Substance use history section of the substance abuse assessment.

CREATE TABLE assessment_substance_use_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age_first_alcohol_use INTEGER
        CHECK (age_first_alcohol_use IS NULL OR (age_first_alcohol_use >= 0 AND age_first_alcohol_use <= 120)),
    age_first_drug_use INTEGER
        CHECK (age_first_drug_use IS NULL OR (age_first_drug_use >= 0 AND age_first_drug_use <= 120)),
    primary_substance VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (primary_substance IN ('alcohol', 'cannabis', 'cocaine', 'heroin', 'methamphetamine', 'benzodiazepines', 'opioid-painkillers', 'other', '')),
    primary_substance_other TEXT NOT NULL DEFAULT '',
    secondary_substances TEXT NOT NULL DEFAULT '',
    route_of_administration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (route_of_administration IN ('oral', 'smoking', 'snorting', 'injecting', 'multiple', '')),
    frequency_of_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (frequency_of_use IN ('daily', 'several-times-week', 'weekly', 'monthly', 'occasionally', '')),
    duration_of_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (duration_of_use IN ('less-1-year', '1-5-years', '5-10-years', 'greater-10-years', '')),
    last_use_date DATE,
    current_use_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (current_use_status IN ('actively-using', 'in-withdrawal', 'early-recovery', 'sustained-recovery', '')),
    iv_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (iv_drug_use IN ('yes', 'no', '')),
    needle_sharing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (needle_sharing IN ('yes', 'no', '')),
    substance_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_substance_use_history_updated_at
    BEFORE UPDATE ON assessment_substance_use_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_substance_use_history IS
    'Substance use history section: substances used, routes, frequency, duration, and injection practices. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_substance_use_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_substance_use_history.age_first_alcohol_use IS
    'Age at first alcohol use in years.';
COMMENT ON COLUMN assessment_substance_use_history.age_first_drug_use IS
    'Age at first drug use in years.';
COMMENT ON COLUMN assessment_substance_use_history.primary_substance IS
    'Primary substance of concern: alcohol, cannabis, cocaine, heroin, methamphetamine, benzodiazepines, opioid-painkillers, other, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.primary_substance_other IS
    'Details if primary substance is other.';
COMMENT ON COLUMN assessment_substance_use_history.secondary_substances IS
    'Free-text list of secondary substances used.';
COMMENT ON COLUMN assessment_substance_use_history.route_of_administration IS
    'Primary route of administration: oral, smoking, snorting, injecting, multiple, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.frequency_of_use IS
    'Frequency of substance use: daily, several-times-week, weekly, monthly, occasionally, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.duration_of_use IS
    'Duration of problematic use: less-1-year, 1-5-years, 5-10-years, greater-10-years, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.last_use_date IS
    'Date of most recent substance use.';
COMMENT ON COLUMN assessment_substance_use_history.current_use_status IS
    'Current use status: actively-using, in-withdrawal, early-recovery, sustained-recovery, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.iv_drug_use IS
    'Whether the patient has a history of intravenous drug use: yes, no, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.needle_sharing IS
    'Whether the patient has shared needles: yes, no, or empty.';
COMMENT ON COLUMN assessment_substance_use_history.substance_history_notes IS
    'Additional clinician notes on substance use history.';

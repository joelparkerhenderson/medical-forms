-- 09_assessment_exacerbation_history.sql
-- Exacerbation history section of the asthma assessment.

CREATE TABLE assessment_exacerbation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    exacerbations_past_12_months INTEGER
        CHECK (exacerbations_past_12_months IS NULL OR exacerbations_past_12_months >= 0),
    oral_steroid_courses_past_12_months INTEGER
        CHECK (oral_steroid_courses_past_12_months IS NULL OR oral_steroid_courses_past_12_months >= 0),
    ed_visits_past_12_months INTEGER
        CHECK (ed_visits_past_12_months IS NULL OR ed_visits_past_12_months >= 0),
    hospital_admissions_past_12_months INTEGER
        CHECK (hospital_admissions_past_12_months IS NULL OR hospital_admissions_past_12_months >= 0),
    icu_admissions_ever INTEGER
        CHECK (icu_admissions_ever IS NULL OR icu_admissions_ever >= 0),
    intubation_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intubation_history IN ('yes', 'no', '')),
    worst_exacerbation_details TEXT NOT NULL DEFAULT '',
    has_asthma_action_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_asthma_action_plan IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_exacerbation_history_updated_at
    BEFORE UPDATE ON assessment_exacerbation_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_exacerbation_history IS
    'Exacerbation history section: past asthma attacks, hospitalisations, and emergency visits. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_exacerbation_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_exacerbation_history.exacerbations_past_12_months IS
    'Number of asthma exacerbations in the past 12 months, NULL if unanswered.';
COMMENT ON COLUMN assessment_exacerbation_history.oral_steroid_courses_past_12_months IS
    'Number of oral corticosteroid courses in the past 12 months, NULL if unanswered.';
COMMENT ON COLUMN assessment_exacerbation_history.ed_visits_past_12_months IS
    'Number of emergency department visits for asthma in the past 12 months, NULL if unanswered.';
COMMENT ON COLUMN assessment_exacerbation_history.hospital_admissions_past_12_months IS
    'Number of hospital admissions for asthma in the past 12 months, NULL if unanswered.';
COMMENT ON COLUMN assessment_exacerbation_history.icu_admissions_ever IS
    'Total number of ICU admissions for asthma over lifetime, NULL if unanswered.';
COMMENT ON COLUMN assessment_exacerbation_history.intubation_history IS
    'Whether the patient has ever been intubated for asthma.';
COMMENT ON COLUMN assessment_exacerbation_history.worst_exacerbation_details IS
    'Details of the most severe asthma exacerbation.';
COMMENT ON COLUMN assessment_exacerbation_history.has_asthma_action_plan IS
    'Whether the patient has a written asthma action plan.';

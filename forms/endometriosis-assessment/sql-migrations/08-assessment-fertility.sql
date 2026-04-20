-- 08_assessment_fertility.sql
-- Fertility assessment section of the endometriosis assessment.

CREATE TABLE assessment_fertility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    trying_to_conceive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trying_to_conceive IN ('yes', 'no', '')),
    duration_trying_months INTEGER
        CHECK (duration_trying_months IS NULL OR duration_trying_months >= 0),
    previous_pregnancies INTEGER
        CHECK (previous_pregnancies IS NULL OR previous_pregnancies >= 0),
    live_births INTEGER
        CHECK (live_births IS NULL OR live_births >= 0),
    miscarriages INTEGER
        CHECK (miscarriages IS NULL OR miscarriages >= 0),
    ectopic_pregnancies INTEGER
        CHECK (ectopic_pregnancies IS NULL OR ectopic_pregnancies >= 0),
    previous_fertility_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_fertility_treatment IN ('yes', 'no', '')),
    fertility_treatment_details TEXT NOT NULL DEFAULT '',
    amh_level NUMERIC(5,2),
    partner_semen_analysis VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (partner_semen_analysis IN ('normal', 'abnormal', 'not-done', '')),
    future_fertility_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (future_fertility_concerns IN ('yes', 'no', '')),
    fertility_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_fertility_updated_at
    BEFORE UPDATE ON assessment_fertility
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_fertility IS
    'Fertility assessment section: conception history, fertility treatment, ovarian reserve. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_fertility.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_fertility.trying_to_conceive IS
    'Whether the patient is currently trying to conceive: yes, no, or empty.';
COMMENT ON COLUMN assessment_fertility.duration_trying_months IS
    'Number of months actively trying to conceive.';
COMMENT ON COLUMN assessment_fertility.previous_pregnancies IS
    'Total number of previous pregnancies (gravidity).';
COMMENT ON COLUMN assessment_fertility.live_births IS
    'Number of previous live births (parity).';
COMMENT ON COLUMN assessment_fertility.miscarriages IS
    'Number of previous miscarriages.';
COMMENT ON COLUMN assessment_fertility.ectopic_pregnancies IS
    'Number of previous ectopic pregnancies.';
COMMENT ON COLUMN assessment_fertility.previous_fertility_treatment IS
    'Whether the patient has undergone previous fertility treatment: yes, no, or empty.';
COMMENT ON COLUMN assessment_fertility.fertility_treatment_details IS
    'Details of previous fertility treatments (e.g. IVF cycles, IUI).';
COMMENT ON COLUMN assessment_fertility.amh_level IS
    'Anti-Mullerian hormone level (pmol/L) as measure of ovarian reserve.';
COMMENT ON COLUMN assessment_fertility.partner_semen_analysis IS
    'Partner semen analysis result: normal, abnormal, not-done, or empty.';
COMMENT ON COLUMN assessment_fertility.future_fertility_concerns IS
    'Whether the patient has concerns about future fertility: yes, no, or empty.';
COMMENT ON COLUMN assessment_fertility.fertility_notes IS
    'Additional clinician notes on fertility assessment.';

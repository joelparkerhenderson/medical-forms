-- 04_assessment_reproductive_history.sql
-- Reproductive history section of the contraception assessment.

CREATE TABLE assessment_reproductive_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gravida INTEGER
        CHECK (gravida IS NULL OR (gravida >= 0 AND gravida <= 30)),
    para INTEGER
        CHECK (para IS NULL OR (para >= 0 AND para <= 20)),
    miscarriages INTEGER
        CHECK (miscarriages IS NULL OR (miscarriages >= 0 AND miscarriages <= 20)),
    terminations INTEGER
        CHECK (terminations IS NULL OR (terminations >= 0 AND terminations <= 20)),
    ectopic_pregnancies INTEGER
        CHECK (ectopic_pregnancies IS NULL OR (ectopic_pregnancies >= 0 AND ectopic_pregnancies <= 10)),
    last_delivery_date DATE,
    last_delivery_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (last_delivery_method IN ('vaginal', 'caesarean', 'instrumental', 'other', '')),
    breastfeeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breastfeeding IN ('yes', 'no', '')),
    weeks_postpartum INTEGER
        CHECK (weeks_postpartum IS NULL OR (weeks_postpartum >= 0 AND weeks_postpartum <= 260)),
    currently_pregnant VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (currently_pregnant IN ('yes', 'no', 'unsure', '')),
    pregnancy_test_date DATE,
    pregnancy_test_result VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pregnancy_test_result IN ('positive', 'negative', 'not-done', '')),
    reproductive_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reproductive_history_updated_at
    BEFORE UPDATE ON assessment_reproductive_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reproductive_history IS
    'Reproductive history section: gravidity, parity, pregnancy history, and postpartum status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reproductive_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reproductive_history.gravida IS
    'Total number of pregnancies including current.';
COMMENT ON COLUMN assessment_reproductive_history.para IS
    'Number of live births beyond 24 weeks gestation.';
COMMENT ON COLUMN assessment_reproductive_history.miscarriages IS
    'Number of miscarriages.';
COMMENT ON COLUMN assessment_reproductive_history.terminations IS
    'Number of terminations of pregnancy.';
COMMENT ON COLUMN assessment_reproductive_history.ectopic_pregnancies IS
    'Number of ectopic pregnancies.';
COMMENT ON COLUMN assessment_reproductive_history.last_delivery_date IS
    'Date of the most recent delivery.';
COMMENT ON COLUMN assessment_reproductive_history.last_delivery_method IS
    'Method of last delivery: vaginal, caesarean, instrumental, other, or empty.';
COMMENT ON COLUMN assessment_reproductive_history.breastfeeding IS
    'Whether the patient is currently breastfeeding: yes, no, or empty.';
COMMENT ON COLUMN assessment_reproductive_history.weeks_postpartum IS
    'Number of weeks since last delivery.';
COMMENT ON COLUMN assessment_reproductive_history.currently_pregnant IS
    'Whether the patient is currently pregnant: yes, no, unsure, or empty.';
COMMENT ON COLUMN assessment_reproductive_history.pregnancy_test_date IS
    'Date of most recent pregnancy test.';
COMMENT ON COLUMN assessment_reproductive_history.pregnancy_test_result IS
    'Result of pregnancy test: positive, negative, not-done, or empty.';
COMMENT ON COLUMN assessment_reproductive_history.reproductive_history_notes IS
    'Additional clinician notes on reproductive history.';

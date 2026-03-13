-- ============================================================
-- 05_assessment_medications.sql
-- Medications section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_medications (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    metformin               TEXT NOT NULL DEFAULT ''
                            CHECK (metformin IN ('yes', 'no', '')),
    sulfonylurea            TEXT NOT NULL DEFAULT ''
                            CHECK (sulfonylurea IN ('yes', 'no', 'previouslyUsed', '')),
    sglt2_inhibitor         TEXT NOT NULL DEFAULT ''
                            CHECK (sglt2_inhibitor IN ('yes', 'no', 'contraindicated', '')),
    glp1_agonist            TEXT NOT NULL DEFAULT ''
                            CHECK (glp1_agonist IN ('yes', 'no', 'previouslyUsed', '')),
    dpp4_inhibitor          TEXT NOT NULL DEFAULT ''
                            CHECK (dpp4_inhibitor IN ('yes', 'no', '')),
    insulin                 TEXT NOT NULL DEFAULT ''
                            CHECK (insulin IN ('yes', 'no', '')),
    insulin_regimen         TEXT NOT NULL DEFAULT ''
                            CHECK (insulin_regimen IN ('basalOnly', 'basalBolus', 'mixedInsulin', 'pump', 'notApplicable', '')),
    insulin_daily_dose      NUMERIC(6,1) CHECK (insulin_daily_dose IS NULL OR insulin_daily_dose >= 0),
    medication_adherence    INTEGER CHECK (medication_adherence IS NULL OR (medication_adherence >= 1 AND medication_adherence <= 5)),
    other_medications       TEXT NOT NULL DEFAULT '',

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_medications_updated_at
    BEFORE UPDATE ON assessment_medications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medications IS
    '1:1 with assessment. Current diabetes medications and adherence.';
COMMENT ON COLUMN assessment_medications.metformin IS
    'Currently taking metformin: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medications.insulin IS
    'Currently on insulin: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medications.insulin_regimen IS
    'Type of insulin regimen if applicable.';
COMMENT ON COLUMN assessment_medications.medication_adherence IS
    'Self-reported adherence score (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN assessment_medications.other_medications IS
    'Free-text list of non-diabetes medications.';

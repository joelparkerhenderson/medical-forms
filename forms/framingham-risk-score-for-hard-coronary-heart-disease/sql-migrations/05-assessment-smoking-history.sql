-- 05_assessment_smoking_history.sql
-- Step 3: Smoking history section of the Framingham Risk Score assessment.

CREATE TABLE assessment_smoking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'former', 'never', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    years_smoked INTEGER
        CHECK (years_smoked IS NULL OR years_smoked >= 0),
    years_since_quit INTEGER
        CHECK (years_since_quit IS NULL OR years_since_quit >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_smoking_history_updated_at
    BEFORE UPDATE ON assessment_smoking_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_smoking_history IS
    'Step 3 Smoking History: tobacco use for Framingham risk calculation. Current smoking is a major CHD risk factor. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_smoking_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_smoking_history.smoking_status IS
    'Smoking status: current (active Framingham risk factor), former, or never.';
COMMENT ON COLUMN assessment_smoking_history.cigarettes_per_day IS
    'Average number of cigarettes smoked per day.';
COMMENT ON COLUMN assessment_smoking_history.years_smoked IS
    'Total years of active smoking.';
COMMENT ON COLUMN assessment_smoking_history.years_since_quit IS
    'Years since the patient quit smoking (for former smokers).';

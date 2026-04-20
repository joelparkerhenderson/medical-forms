-- 10_assessment_lifestyle.sql
-- Lifestyle assessment section of the birth control assessment.

CREATE TABLE assessment_lifestyle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'ex-smoker', 'never', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    age_over_35_smoker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (age_over_35_smoker IN ('yes', 'no', '')),
    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'within-guidelines', 'above-guidelines', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    recreational_drug_details TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('none', 'occasional', 'regular', 'daily', '')),
    sexual_activity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexual_activity IN ('yes', 'no', '')),
    number_of_partners VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (number_of_partners IN ('one', 'multiple', '')),
    pregnancy_risk_awareness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pregnancy_risk_awareness IN ('yes', 'no', '')),
    lifestyle_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_updated_at
    BEFORE UPDATE ON assessment_lifestyle
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle IS
    'Lifestyle assessment section: smoking, alcohol, drugs, exercise, and sexual health. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lifestyle.smoking_status IS
    'Smoking status: current, ex-smoker, never, or empty. Critical for COC eligibility (UK MEC 3/4 if age >35 and >15 cigs/day).';
COMMENT ON COLUMN assessment_lifestyle.cigarettes_per_day IS
    'Number of cigarettes smoked per day.';
COMMENT ON COLUMN assessment_lifestyle.age_over_35_smoker IS
    'Whether patient is aged over 35 and smokes (UK MEC 3/4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle.alcohol_consumption IS
    'Alcohol consumption level: none, within-guidelines, above-guidelines, or empty.';
COMMENT ON COLUMN assessment_lifestyle.alcohol_units_per_week IS
    'Approximate alcohol units consumed per week.';
COMMENT ON COLUMN assessment_lifestyle.recreational_drug_use IS
    'Whether the patient uses recreational drugs: yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle.recreational_drug_details IS
    'Details of recreational drug use.';
COMMENT ON COLUMN assessment_lifestyle.exercise_frequency IS
    'Exercise frequency: none, occasional, regular, daily, or empty.';
COMMENT ON COLUMN assessment_lifestyle.sexual_activity IS
    'Whether the patient is currently sexually active: yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle.number_of_partners IS
    'Number of sexual partners: one, multiple, or empty.';
COMMENT ON COLUMN assessment_lifestyle.pregnancy_risk_awareness IS
    'Whether the patient is aware of pregnancy risks without contraception: yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle.lifestyle_notes IS
    'Additional clinician notes on lifestyle factors.';

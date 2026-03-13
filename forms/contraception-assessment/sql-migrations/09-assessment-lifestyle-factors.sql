-- 09_assessment_lifestyle_factors.sql
-- Lifestyle factors section of the contraception assessment.

CREATE TABLE assessment_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'within-guidelines', 'above-guidelines', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    recreational_drug_details TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'several-per-week', 'weekly', 'rarely', 'never', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    shift_work VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shift_work IN ('yes', 'no', '')),
    travel_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (travel_frequency IN ('frequent', 'occasional', 'rare', 'never', '')),
    sexual_activity_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sexual_activity_frequency IN ('daily', 'weekly', 'monthly', 'rarely', 'not-currently', '')),
    number_of_partners VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (number_of_partners IN ('one', 'multiple', 'none', '')),
    condom_use_for_sti_prevention VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (condom_use_for_sti_prevention IN ('always', 'sometimes', 'never', '')),
    lifestyle_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_factors_updated_at
    BEFORE UPDATE ON assessment_lifestyle_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle_factors IS
    'Lifestyle factors section: alcohol, drugs, exercise, occupation, sexual activity, STI prevention. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lifestyle_factors.alcohol_consumption IS
    'Alcohol consumption level: none, within-guidelines, above-guidelines, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.alcohol_units_per_week IS
    'Approximate alcohol units consumed per week.';
COMMENT ON COLUMN assessment_lifestyle_factors.recreational_drug_use IS
    'Whether the patient uses recreational drugs: yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.recreational_drug_details IS
    'Details of recreational drug use.';
COMMENT ON COLUMN assessment_lifestyle_factors.exercise_frequency IS
    'Frequency of exercise: daily, several-per-week, weekly, rarely, never, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.occupation IS
    'Patient occupation.';
COMMENT ON COLUMN assessment_lifestyle_factors.shift_work IS
    'Whether the patient does shift work (affects method adherence): yes, no, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.travel_frequency IS
    'Frequency of travel (affects method availability and VTE risk): frequent, occasional, rare, never, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.sexual_activity_frequency IS
    'Frequency of sexual activity: daily, weekly, monthly, rarely, not-currently, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.number_of_partners IS
    'Number of sexual partners: one, multiple, none, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.condom_use_for_sti_prevention IS
    'Frequency of condom use for STI prevention: always, sometimes, never, or empty.';
COMMENT ON COLUMN assessment_lifestyle_factors.lifestyle_notes IS
    'Additional clinician notes on lifestyle factors.';

-- 04_assessment_symptom_frequency.sql
-- Symptom frequency section of the asthma assessment (ACT questions).

CREATE TABLE assessment_symptom_frequency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    act_q1_activity_limitation INTEGER
        CHECK (act_q1_activity_limitation IS NULL OR (act_q1_activity_limitation >= 1 AND act_q1_activity_limitation <= 5)),
    act_q2_shortness_of_breath INTEGER
        CHECK (act_q2_shortness_of_breath IS NULL OR (act_q2_shortness_of_breath >= 1 AND act_q2_shortness_of_breath <= 5)),
    act_q3_night_symptoms INTEGER
        CHECK (act_q3_night_symptoms IS NULL OR (act_q3_night_symptoms >= 1 AND act_q3_night_symptoms <= 5)),
    act_q4_rescue_inhaler_use INTEGER
        CHECK (act_q4_rescue_inhaler_use IS NULL OR (act_q4_rescue_inhaler_use >= 1 AND act_q4_rescue_inhaler_use <= 5)),
    act_q5_self_rated_control INTEGER
        CHECK (act_q5_self_rated_control IS NULL OR (act_q5_self_rated_control >= 1 AND act_q5_self_rated_control <= 5)),
    daytime_symptom_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (daytime_symptom_frequency IN ('none', 'less_than_weekly', 'weekly', 'daily', 'continuous', '')),
    nocturnal_symptom_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (nocturnal_symptom_frequency IN ('none', 'less_than_monthly', 'monthly', 'weekly', 'nightly', '')),
    exercise_induced_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_induced_symptoms IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_symptom_frequency_updated_at
    BEFORE UPDATE ON assessment_symptom_frequency
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_symptom_frequency IS
    'Symptom frequency section: five ACT (Asthma Control Test) scored questions (1-5 each) plus supplemental symptom frequency. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_symptom_frequency.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_symptom_frequency.act_q1_activity_limitation IS
    'ACT Q1: How much did asthma keep you from getting as much done at work/school/home? (1=all of the time, 5=none of the time).';
COMMENT ON COLUMN assessment_symptom_frequency.act_q2_shortness_of_breath IS
    'ACT Q2: How often have you had shortness of breath? (1=more than once a day, 5=not at all).';
COMMENT ON COLUMN assessment_symptom_frequency.act_q3_night_symptoms IS
    'ACT Q3: How often did asthma symptoms wake you up at night or earlier than usual? (1=4+ nights/week, 5=not at all).';
COMMENT ON COLUMN assessment_symptom_frequency.act_q4_rescue_inhaler_use IS
    'ACT Q4: How often have you used your rescue inhaler or nebuliser? (1=3+ times/day, 5=not at all).';
COMMENT ON COLUMN assessment_symptom_frequency.act_q5_self_rated_control IS
    'ACT Q5: How would you rate your asthma control? (1=not controlled at all, 5=completely controlled).';
COMMENT ON COLUMN assessment_symptom_frequency.daytime_symptom_frequency IS
    'Frequency of daytime asthma symptoms.';
COMMENT ON COLUMN assessment_symptom_frequency.nocturnal_symptom_frequency IS
    'Frequency of nocturnal asthma symptoms.';
COMMENT ON COLUMN assessment_symptom_frequency.exercise_induced_symptoms IS
    'Whether the patient experiences exercise-induced asthma symptoms.';

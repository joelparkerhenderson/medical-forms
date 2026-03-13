-- 10_assessment_sleep_medication_use.sql
-- Sleep medication use section of the sleep quality assessment (PSQI Component 6).

CREATE TABLE assessment_sleep_medication_use (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI Q7: frequency of sleep medication use
    sleep_medication_frequency INTEGER
        CHECK (sleep_medication_frequency IS NULL OR (sleep_medication_frequency >= 0 AND sleep_medication_frequency <= 3)),

    prescribed_sleep_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (prescribed_sleep_medication IN ('yes', 'no', '')),
    prescribed_medication_names TEXT NOT NULL DEFAULT '',
    prescribed_medication_dose TEXT NOT NULL DEFAULT '',
    prescribed_medication_duration_months INTEGER
        CHECK (prescribed_medication_duration_months IS NULL OR prescribed_medication_duration_months >= 0),
    over_the_counter_sleep_aids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (over_the_counter_sleep_aids IN ('yes', 'no', '')),
    otc_sleep_aid_details TEXT NOT NULL DEFAULT '',
    melatonin_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (melatonin_use IN ('yes', 'no', '')),
    melatonin_dose_mg NUMERIC(4,1)
        CHECK (melatonin_dose_mg IS NULL OR melatonin_dose_mg >= 0),
    herbal_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (herbal_supplements IN ('yes', 'no', '')),
    herbal_supplement_details TEXT NOT NULL DEFAULT '',
    caffeine_daily_intake VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (caffeine_daily_intake IN ('none', 'low', 'moderate', 'high', '')),
    caffeine_last_intake_time TIME,
    alcohol_as_sleep_aid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alcohol_as_sleep_aid IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_medication_use_updated_at
    BEFORE UPDATE ON assessment_sleep_medication_use
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_medication_use IS
    'Sleep medication use section (PSQI Component 6): prescribed, OTC, and supplemental sleep aids. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_medication_use.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_medication_use.sleep_medication_frequency IS
    'PSQI Q7: frequency of sleep medication use; 0=not at all, 1=<1/week, 2=1-2/week, 3=>=3/week.';
COMMENT ON COLUMN assessment_sleep_medication_use.prescribed_sleep_medication IS
    'Whether patient uses prescribed sleep medication.';
COMMENT ON COLUMN assessment_sleep_medication_use.prescribed_medication_names IS
    'Names of prescribed sleep medications.';
COMMENT ON COLUMN assessment_sleep_medication_use.prescribed_medication_dose IS
    'Dosage of prescribed sleep medications.';
COMMENT ON COLUMN assessment_sleep_medication_use.prescribed_medication_duration_months IS
    'Duration of prescribed sleep medication use in months.';
COMMENT ON COLUMN assessment_sleep_medication_use.over_the_counter_sleep_aids IS
    'Whether patient uses over-the-counter sleep aids.';
COMMENT ON COLUMN assessment_sleep_medication_use.otc_sleep_aid_details IS
    'Details of OTC sleep aids used.';
COMMENT ON COLUMN assessment_sleep_medication_use.melatonin_use IS
    'Whether patient uses melatonin supplements.';
COMMENT ON COLUMN assessment_sleep_medication_use.melatonin_dose_mg IS
    'Melatonin dose in milligrams.';
COMMENT ON COLUMN assessment_sleep_medication_use.herbal_supplements IS
    'Whether patient uses herbal sleep supplements (e.g. valerian, chamomile).';
COMMENT ON COLUMN assessment_sleep_medication_use.herbal_supplement_details IS
    'Details of herbal supplements used for sleep.';
COMMENT ON COLUMN assessment_sleep_medication_use.caffeine_daily_intake IS
    'Daily caffeine intake level: none, low, moderate, high, or empty string.';
COMMENT ON COLUMN assessment_sleep_medication_use.caffeine_last_intake_time IS
    'Time of last caffeine intake in the day.';
COMMENT ON COLUMN assessment_sleep_medication_use.alcohol_as_sleep_aid IS
    'Whether patient uses alcohol as a sleep aid.';

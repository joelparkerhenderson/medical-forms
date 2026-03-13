-- 11_assessment_social_history.sql
-- Social history section of the asthma assessment.

CREATE TABLE assessment_social_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'current', 'former', '')),
    pack_years NUMERIC(5,1)
        CHECK (pack_years IS NULL OR pack_years >= 0),
    vaping_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vaping_status IN ('never', 'current', 'former', '')),
    passive_smoke_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (passive_smoke_exposure IN ('yes', 'no', '')),
    housing_type VARCHAR(50) NOT NULL DEFAULT '',
    housing_damp_or_mould VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (housing_damp_or_mould IN ('yes', 'no', '')),
    pets_in_home VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pets_in_home IN ('yes', 'no', '')),
    pet_details TEXT NOT NULL DEFAULT '',
    occupational_exposures TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(30) NOT NULL DEFAULT '',
    impact_on_daily_life TEXT NOT NULL DEFAULT '',
    days_missed_work_or_school INTEGER
        CHECK (days_missed_work_or_school IS NULL OR days_missed_work_or_school >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_history_updated_at
    BEFORE UPDATE ON assessment_social_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_history IS
    'Social history section: smoking, housing, occupational exposures, and impact on daily life. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_history.smoking_status IS
    'Smoking status: never, current, former, or empty string if unanswered.';
COMMENT ON COLUMN assessment_social_history.pack_years IS
    'Smoking pack-years (packs per day multiplied by years smoked), NULL if unanswered.';
COMMENT ON COLUMN assessment_social_history.vaping_status IS
    'Vaping/e-cigarette status: never, current, former, or empty string if unanswered.';
COMMENT ON COLUMN assessment_social_history.passive_smoke_exposure IS
    'Whether the patient is exposed to passive smoke at home or work.';
COMMENT ON COLUMN assessment_social_history.housing_type IS
    'Type of housing (e.g. house, flat, sheltered accommodation).';
COMMENT ON COLUMN assessment_social_history.housing_damp_or_mould IS
    'Whether the home has damp or mould problems.';
COMMENT ON COLUMN assessment_social_history.pets_in_home IS
    'Whether there are pets in the home.';
COMMENT ON COLUMN assessment_social_history.pet_details IS
    'Details of pets in the home (type, number).';
COMMENT ON COLUMN assessment_social_history.occupational_exposures IS
    'Details of occupational exposures relevant to asthma.';
COMMENT ON COLUMN assessment_social_history.exercise_frequency IS
    'How often the patient exercises.';
COMMENT ON COLUMN assessment_social_history.impact_on_daily_life IS
    'Description of how asthma impacts daily activities and quality of life.';
COMMENT ON COLUMN assessment_social_history.days_missed_work_or_school IS
    'Number of days missed from work or school due to asthma in the past 12 months, NULL if unanswered.';

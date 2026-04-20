-- 08_assessment_covid19_vaccination.sql
-- COVID-19 vaccination section of the vaccinations checklist.

CREATE TABLE assessment_covid19_vaccination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    covid_primary_course VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_primary_course IN ('yes', 'no', 'unknown', '')),
    covid_primary_vaccine_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (covid_primary_vaccine_type IN ('pfizer', 'moderna', 'astrazeneca', 'novavax', 'janssen', 'other', '')),
    covid_dose_1_date DATE,
    covid_dose_2_date DATE,
    covid_booster_1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_booster_1 IN ('yes', 'no', '')),
    covid_booster_1_date DATE,
    covid_booster_1_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (covid_booster_1_type IN ('pfizer', 'moderna', 'astrazeneca', 'novavax', 'other', '')),
    covid_booster_2 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_booster_2 IN ('yes', 'no', '')),
    covid_booster_2_date DATE,
    covid_booster_2_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (covid_booster_2_type IN ('pfizer', 'moderna', 'novavax', 'other', '')),
    covid_autumn_booster VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_autumn_booster IN ('yes', 'no', '')),
    covid_autumn_booster_date DATE,
    total_covid_doses INTEGER
        CHECK (total_covid_doses IS NULL OR (total_covid_doses >= 0 AND total_covid_doses <= 10)),
    covid_adverse_reaction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_adverse_reaction IN ('yes', 'no', '')),
    covid_adverse_reaction_details TEXT NOT NULL DEFAULT '',
    covid19_vaccination_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_covid19_vaccination_updated_at
    BEFORE UPDATE ON assessment_covid19_vaccination
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_covid19_vaccination IS
    'COVID-19 vaccination section: primary course, boosters, vaccine types, adverse reactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_covid19_vaccination.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_primary_course IS
    'Whether COVID-19 primary course is complete: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_primary_vaccine_type IS
    'Type of primary COVID-19 vaccine: pfizer, moderna, astrazeneca, novavax, janssen, other, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_dose_1_date IS
    'Date of COVID-19 dose 1.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_dose_2_date IS
    'Date of COVID-19 dose 2.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_1 IS
    'Whether first COVID-19 booster has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_1_date IS
    'Date of first COVID-19 booster.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_1_type IS
    'Type of first booster: pfizer, moderna, astrazeneca, novavax, other, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_2 IS
    'Whether second COVID-19 booster has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_2_date IS
    'Date of second COVID-19 booster.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_booster_2_type IS
    'Type of second booster: pfizer, moderna, novavax, other, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_autumn_booster IS
    'Whether seasonal autumn booster has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_autumn_booster_date IS
    'Date of seasonal autumn COVID-19 booster.';
COMMENT ON COLUMN assessment_covid19_vaccination.total_covid_doses IS
    'Total number of COVID-19 vaccine doses received.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_adverse_reaction IS
    'Whether there was an adverse reaction to a COVID-19 vaccine: yes, no, or empty.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid_adverse_reaction_details IS
    'Details of COVID-19 vaccine adverse reaction.';
COMMENT ON COLUMN assessment_covid19_vaccination.covid19_vaccination_notes IS
    'Additional notes on COVID-19 vaccination.';

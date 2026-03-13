-- 06_assessment_immunization_status.sql
-- Immunization status section of the pediatric assessment.

CREATE TABLE assessment_immunization_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    immunization_up_to_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immunization_up_to_date IN ('yes', 'no', '')),
    immunization_schedule VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (immunization_schedule IN ('uk-nhs', 'who-epi', 'other', '')),
    missed_vaccinations TEXT NOT NULL DEFAULT '',
    vaccine_adverse_reactions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaccine_adverse_reactions IN ('yes', 'no', '')),
    adverse_reaction_details TEXT NOT NULL DEFAULT '',
    vaccine_exemptions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaccine_exemptions IN ('yes', 'no', '')),
    exemption_reason TEXT NOT NULL DEFAULT '',
    bcg_given VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bcg_given IN ('yes', 'no', '')),
    influenza_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (influenza_vaccine IN ('yes', 'no', '')),
    covid_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_vaccine IN ('yes', 'no', '')),
    last_vaccination_date DATE,
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_immunization_status_updated_at
    BEFORE UPDATE ON assessment_immunization_status
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_immunization_status IS
    'Immunization status section: vaccination schedule compliance, missed vaccinations, and adverse reactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_immunization_status.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_immunization_status.immunization_up_to_date IS
    'Whether immunizations are up to date per the relevant schedule.';
COMMENT ON COLUMN assessment_immunization_status.immunization_schedule IS
    'Immunization schedule being followed: uk-nhs, who-epi, other, or empty.';
COMMENT ON COLUMN assessment_immunization_status.missed_vaccinations IS
    'Free-text list of any missed or overdue vaccinations.';
COMMENT ON COLUMN assessment_immunization_status.vaccine_adverse_reactions IS
    'Whether the child has had adverse reactions to any vaccines.';
COMMENT ON COLUMN assessment_immunization_status.adverse_reaction_details IS
    'Details of any vaccine adverse reactions.';
COMMENT ON COLUMN assessment_immunization_status.vaccine_exemptions IS
    'Whether there are any vaccine exemptions (medical or other).';
COMMENT ON COLUMN assessment_immunization_status.exemption_reason IS
    'Reason for vaccine exemption, if applicable.';
COMMENT ON COLUMN assessment_immunization_status.bcg_given IS
    'Whether BCG (tuberculosis) vaccination has been given.';
COMMENT ON COLUMN assessment_immunization_status.influenza_vaccine IS
    'Whether annual influenza vaccine has been given.';
COMMENT ON COLUMN assessment_immunization_status.covid_vaccine IS
    'Whether COVID-19 vaccination has been given.';
COMMENT ON COLUMN assessment_immunization_status.last_vaccination_date IS
    'Date of most recent vaccination.';

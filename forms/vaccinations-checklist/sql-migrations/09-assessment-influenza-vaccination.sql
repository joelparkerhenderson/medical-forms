-- 09_assessment_influenza_vaccination.sql
-- Influenza vaccination section of the vaccinations checklist.

CREATE TABLE assessment_influenza_vaccination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    flu_vaccine_current_season VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_vaccine_current_season IN ('yes', 'no', '')),
    flu_vaccine_current_date DATE,
    flu_vaccine_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (flu_vaccine_type IN ('standard', 'adjuvanted', 'cell-based', 'recombinant', 'nasal-spray', 'other', '')),
    flu_vaccine_previous_season VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_vaccine_previous_season IN ('yes', 'no', 'unknown', '')),
    flu_vaccine_annual_recipient VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_vaccine_annual_recipient IN ('yes', 'no', '')),
    flu_high_risk_group VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_high_risk_group IN ('yes', 'no', '')),
    flu_high_risk_reason VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (flu_high_risk_reason IN ('age-65-plus', 'chronic-respiratory', 'chronic-heart', 'chronic-kidney', 'chronic-liver', 'diabetes', 'immunosuppressed', 'pregnant', 'healthcare-worker', 'carer', 'other', '')),
    flu_adverse_reaction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_adverse_reaction IN ('yes', 'no', '')),
    flu_adverse_reaction_details TEXT NOT NULL DEFAULT '',
    influenza_vaccination_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_influenza_vaccination_updated_at
    BEFORE UPDATE ON assessment_influenza_vaccination
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_influenza_vaccination IS
    'Influenza vaccination section: current season, type, high-risk group, adverse reactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_influenza_vaccination.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_vaccine_current_season IS
    'Whether current season flu vaccine has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_vaccine_current_date IS
    'Date current season flu vaccine was administered.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_vaccine_type IS
    'Type of flu vaccine: standard, adjuvanted, cell-based, recombinant, nasal-spray, other, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_vaccine_previous_season IS
    'Whether previous season flu vaccine was received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_vaccine_annual_recipient IS
    'Whether the patient is a regular annual flu vaccine recipient: yes, no, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_high_risk_group IS
    'Whether the patient belongs to a flu high-risk group: yes, no, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_high_risk_reason IS
    'Reason for high-risk group: age-65-plus, chronic conditions, immunosuppressed, pregnant, healthcare-worker, carer, other, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_adverse_reaction IS
    'Whether there was an adverse reaction to flu vaccine: yes, no, or empty.';
COMMENT ON COLUMN assessment_influenza_vaccination.flu_adverse_reaction_details IS
    'Details of flu vaccine adverse reaction.';
COMMENT ON COLUMN assessment_influenza_vaccination.influenza_vaccination_notes IS
    'Additional notes on influenza vaccination.';

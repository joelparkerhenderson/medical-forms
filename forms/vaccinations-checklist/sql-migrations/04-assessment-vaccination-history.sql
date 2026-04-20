-- 04_assessment_vaccination_history.sql
-- Vaccination history section of the vaccinations checklist.

CREATE TABLE assessment_vaccination_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_vaccination_record VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_vaccination_record IN ('yes', 'no', '')),
    record_source VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (record_source IN ('red-book', 'gp-records', 'occupational-health', 'self-reported', 'overseas-records', 'other', '')),
    record_source_other TEXT NOT NULL DEFAULT '',
    previous_adverse_reaction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_adverse_reaction IN ('yes', 'no', '')),
    adverse_reaction_details TEXT NOT NULL DEFAULT '',
    adverse_reaction_vaccine VARCHAR(255) NOT NULL DEFAULT '',
    adverse_reaction_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adverse_reaction_severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', '')),
    immunocompromised VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immunocompromised IN ('yes', 'no', '')),
    immunocompromised_details TEXT NOT NULL DEFAULT '',
    pregnant_or_planning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pregnant_or_planning IN ('yes', 'no', 'not-applicable', '')),
    vaccination_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_vaccination_history_updated_at
    BEFORE UPDATE ON assessment_vaccination_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_vaccination_history IS
    'Vaccination history section: record availability, previous reactions, immunocompromised status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_vaccination_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_vaccination_history.has_vaccination_record IS
    'Whether the patient has an existing vaccination record: yes, no, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.record_source IS
    'Source of vaccination records: red-book, gp-records, occupational-health, self-reported, overseas-records, other, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.record_source_other IS
    'Details if record source is other.';
COMMENT ON COLUMN assessment_vaccination_history.previous_adverse_reaction IS
    'Whether the patient has had a previous adverse reaction to any vaccine: yes, no, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.adverse_reaction_details IS
    'Details of previous adverse vaccine reaction.';
COMMENT ON COLUMN assessment_vaccination_history.adverse_reaction_vaccine IS
    'Name of vaccine that caused the adverse reaction.';
COMMENT ON COLUMN assessment_vaccination_history.adverse_reaction_severity IS
    'Severity of previous adverse reaction: mild, moderate, severe, anaphylaxis, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.immunocompromised IS
    'Whether the patient is immunocompromised: yes, no, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.immunocompromised_details IS
    'Details of immunocompromised status (e.g. HIV, chemotherapy, biologics).';
COMMENT ON COLUMN assessment_vaccination_history.pregnant_or_planning IS
    'Whether the patient is pregnant or planning pregnancy: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_vaccination_history.vaccination_history_notes IS
    'Additional notes on vaccination history.';

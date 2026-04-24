CREATE TABLE immunization_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    has_vaccination_record VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (has_vaccination_record IN ('yes', 'no', 'unknown', '')),
    record_source VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (record_source IN ('redBook', 'gpRecords', 'nhsApp', 'patientRecall', 'other', '')),
    last_review_date DATE,
    previous_adverse_reactions VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (previous_adverse_reactions IN ('yes', 'no', '')),
    adverse_reaction_details TEXT NOT NULL DEFAULT '',
    immunocompromised VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (immunocompromised IN ('yes', 'no', '')),
    immunocompromised_details TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_immunization_history_updated_at
    BEFORE UPDATE ON immunization_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE immunization_history IS
    'Immunization history including record source and adverse reaction screening. One-to-one child of assessment.';

COMMENT ON COLUMN immunization_history.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN immunization_history.has_vaccination_record IS
    'Has vaccination record. One of: yes, no, unknown.';
COMMENT ON COLUMN immunization_history.record_source IS
    'Record source. One of: redBook, gpRecords, nhsApp, patientRecall, other.';
COMMENT ON COLUMN immunization_history.last_review_date IS
    'Last review date.';
COMMENT ON COLUMN immunization_history.previous_adverse_reactions IS
    'Previous adverse reactions. One of: yes, no.';
COMMENT ON COLUMN immunization_history.adverse_reaction_details IS
    'Adverse reaction details.';
COMMENT ON COLUMN immunization_history.immunocompromised IS
    'Immunocompromised. One of: yes, no.';
COMMENT ON COLUMN immunization_history.immunocompromised_details IS
    'Immunocompromised details.';
COMMENT ON COLUMN immunization_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN immunization_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN immunization_history.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN immunization_history.deleted_at IS
    'Timestamp when this row was deleted.';

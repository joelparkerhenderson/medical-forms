-- 03_immunization_history.sql
-- Immunization history section (Step 2).

CREATE TABLE immunization_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
    immunocompromised_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_immunization_history_updated_at
    BEFORE UPDATE ON immunization_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE immunization_history IS
    'Immunization history including record source and adverse reaction screening. One-to-one child of assessment.';

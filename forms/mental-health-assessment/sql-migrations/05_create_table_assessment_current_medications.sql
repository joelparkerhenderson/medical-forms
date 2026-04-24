CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    taking_psychotropic_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (taking_psychotropic_medication IN ('yes', 'no', '')),
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),
    side_effects VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (side_effects IN ('yes', 'no', '')),
    side_effects_details TEXT NOT NULL DEFAULT '',
    over_the_counter_medications TEXT NOT NULL DEFAULT '',
    supplements TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual medication items (one-to-many child)

COMMENT ON TABLE assessment_current_medications IS
    'Assessment current medications.';
COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_current_medications.taking_psychotropic_medication IS
    'Taking psychotropic medication. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Medication adherence. One of: good, partial, poor.';
COMMENT ON COLUMN assessment_current_medications.side_effects IS
    'Side effects. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.side_effects_details IS
    'Side effects details.';
COMMENT ON COLUMN assessment_current_medications.over_the_counter_medications IS
    'Over the counter medications.';
COMMENT ON COLUMN assessment_current_medications.supplements IS
    'Supplements.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Medication notes.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';

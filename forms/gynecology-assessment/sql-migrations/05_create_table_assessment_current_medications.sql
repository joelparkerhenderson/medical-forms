CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_regular_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_regular_medications IN ('yes', 'no', '')),
    takes_over_the_counter VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_over_the_counter IN ('yes', 'no', '')),
    takes_herbal_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_herbal_supplements IN ('yes', 'no', '')),
    herbal_supplement_details TEXT NOT NULL DEFAULT '',
    hormone_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hormone_therapy IN ('yes', 'no', '')),
    hormone_therapy_details TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual medication entries (one-to-many child)

COMMENT ON TABLE assessment_current_medications IS
    'Assessment current medications.';
COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_current_medications.takes_regular_medications IS
    'Takes regular medications. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.takes_over_the_counter IS
    'Takes over the counter. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.takes_herbal_supplements IS
    'Takes herbal supplements. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.herbal_supplement_details IS
    'Herbal supplement details.';
COMMENT ON COLUMN assessment_current_medications.hormone_therapy IS
    'Hormone therapy. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.hormone_therapy_details IS
    'Hormone therapy details.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Medication notes.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';

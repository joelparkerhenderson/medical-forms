CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_psychiatric_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_psychiatric_medications IN ('yes', 'no', '')),
    takes_other_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_other_medications IN ('yes', 'no', '')),
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'fair', 'poor', '')),
    adherence_barriers TEXT NOT NULL DEFAULT '',
    side_effects TEXT NOT NULL DEFAULT '',
    clozapine_registered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clozapine_registered IN ('yes', 'no', '')),
    depot_injection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depot_injection IN ('yes', 'no', '')),
    depot_details TEXT NOT NULL DEFAULT '',
    adverse_drug_reactions TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_psychiatric_medications IS
    'Whether the patient takes psychiatric medications.';
COMMENT ON COLUMN assessment_current_medications.takes_other_medications IS
    'Whether the patient takes non-psychiatric medications.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Medication adherence: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_current_medications.adherence_barriers IS
    'Free-text description of barriers to medication adherence.';
COMMENT ON COLUMN assessment_current_medications.side_effects IS
    'Free-text description of medication side effects experienced.';
COMMENT ON COLUMN assessment_current_medications.clozapine_registered IS
    'Whether the patient is registered on a clozapine monitoring programme.';
COMMENT ON COLUMN assessment_current_medications.depot_injection IS
    'Whether the patient receives depot (long-acting injectable) medication.';

-- Individual medication items (one-to-many child)

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.depot_details IS
    'Depot details.';
COMMENT ON COLUMN assessment_current_medications.adverse_drug_reactions IS
    'Adverse drug reactions.';
COMMENT ON COLUMN assessment_current_medications.additional_notes IS
    'Additional notes.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';

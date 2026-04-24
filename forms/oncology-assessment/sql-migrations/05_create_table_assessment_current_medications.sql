CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    polypharmacy_concern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polypharmacy_concern IN ('yes', 'no', '')),
    drug_interactions_identified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (drug_interactions_identified IN ('yes', 'no', '')),
    drug_interaction_details TEXT NOT NULL DEFAULT '',
    complementary_medicines VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (complementary_medicines IN ('yes', 'no', '')),
    complementary_medicine_details TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),
    medications_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header: polypharmacy concerns, interactions, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.polypharmacy_concern IS
    'Whether polypharmacy is a concern: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.drug_interactions_identified IS
    'Whether drug interactions have been identified: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.drug_interaction_details IS
    'Details of identified drug interactions.';
COMMENT ON COLUMN assessment_current_medications.complementary_medicines IS
    'Whether the patient uses complementary or alternative medicines: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.complementary_medicine_details IS
    'Details of complementary or alternative medicines being used.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Overall medication adherence: good, partial, poor, or empty.';
COMMENT ON COLUMN assessment_current_medications.medications_notes IS
    'Additional clinician notes on medications.';

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_current_medications.deleted_at IS
    'Timestamp when this row was deleted.';
-- Individual medication items (one-to-many child)


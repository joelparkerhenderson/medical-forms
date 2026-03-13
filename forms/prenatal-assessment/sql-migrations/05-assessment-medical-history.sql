-- 05_assessment_medical_history.sql
-- Medical history section of the prenatal assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('type-1', 'type-2', 'gestational', 'no', '')),
    thyroid_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thyroid_disorder IN ('yes', 'no', '')),
    thyroid_disorder_details TEXT NOT NULL DEFAULT '',
    autoimmune_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (autoimmune_conditions IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epilepsy IN ('yes', 'no', '')),
    cardiac_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiac_conditions IN ('yes', 'no', '')),
    cardiac_details TEXT NOT NULL DEFAULT '',
    renal_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (renal_conditions IN ('yes', 'no', '')),
    renal_details TEXT NOT NULL DEFAULT '',
    thrombophilia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thrombophilia IN ('yes', 'no', '')),
    previous_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_vte IN ('yes', 'no', '')),
    psychiatric_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychiatric_history IN ('yes', 'no', '')),
    psychiatric_details TEXT NOT NULL DEFAULT '',
    previous_surgeries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_surgeries IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    known_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_allergies IN ('yes', 'no', '')),
    allergy_details TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: pre-existing conditions relevant to pregnancy including hypertension, diabetes, thrombophilia, and psychiatric history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.hypertension IS
    'Whether the patient has a history of hypertension.';
COMMENT ON COLUMN assessment_medical_history.diabetes IS
    'Diabetes status: type-1, type-2, gestational, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.thyroid_disorder IS
    'Whether the patient has a thyroid disorder (hypo/hyperthyroidism).';
COMMENT ON COLUMN assessment_medical_history.autoimmune_conditions IS
    'Whether the patient has autoimmune conditions (e.g. lupus, antiphospholipid syndrome).';
COMMENT ON COLUMN assessment_medical_history.epilepsy IS
    'Whether the patient has epilepsy.';
COMMENT ON COLUMN assessment_medical_history.cardiac_conditions IS
    'Whether the patient has cardiac conditions.';
COMMENT ON COLUMN assessment_medical_history.renal_conditions IS
    'Whether the patient has renal conditions.';
COMMENT ON COLUMN assessment_medical_history.thrombophilia IS
    'Whether the patient has a known thrombophilia.';
COMMENT ON COLUMN assessment_medical_history.previous_vte IS
    'Whether the patient has had previous venous thromboembolism (DVT/PE).';
COMMENT ON COLUMN assessment_medical_history.psychiatric_history IS
    'Whether the patient has a psychiatric history.';
COMMENT ON COLUMN assessment_medical_history.known_allergies IS
    'Whether the patient has any known allergies.';

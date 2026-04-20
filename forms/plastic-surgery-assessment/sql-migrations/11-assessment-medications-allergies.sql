-- 11_assessment_medications_allergies.sql
-- Current medications and allergies section of the plastic surgery assessment.

CREATE TABLE assessment_medications_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    on_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    on_antiplatelets VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antiplatelets IN ('yes', 'no', '')),
    antiplatelet_details TEXT NOT NULL DEFAULT '',
    on_steroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_steroids IN ('yes', 'no', '')),
    steroid_details TEXT NOT NULL DEFAULT '',
    on_immunosuppressants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_immunosuppressants IN ('yes', 'no', '')),
    immunosuppressant_details TEXT NOT NULL DEFAULT '',
    on_chemotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_chemotherapy IN ('yes', 'no', '')),
    chemotherapy_details TEXT NOT NULL DEFAULT '',
    on_hormone_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_hormone_therapy IN ('yes', 'no', '')),
    hormone_therapy_details TEXT NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',
    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    adhesive_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adhesive_allergy IN ('yes', 'no', '')),
    other_allergies TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'moderate', 'poor', '')),
    medications_allergies_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medications_allergies_updated_at
    BEFORE UPDATE ON assessment_medications_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medications_allergies IS
    'Medications and allergies section: anticoagulants, steroids, immunosuppressants, drug allergies, latex allergy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medications_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medications_allergies.on_anticoagulants IS
    'Whether the patient is on anticoagulants: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications_allergies.on_steroids IS
    'Whether the patient is on steroids: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications_allergies.on_immunosuppressants IS
    'Whether the patient is on immunosuppressants: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications_allergies.has_drug_allergies IS
    'Whether the patient has drug allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications_allergies.latex_allergy IS
    'Whether the patient has a latex allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications_allergies.adhesive_allergy IS
    'Whether the patient has adhesive/dressing allergy: yes, no, or empty.';

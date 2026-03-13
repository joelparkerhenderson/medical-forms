-- 07_assessment_medical_history.sql
-- Step 5: Medical history section of the dermatology assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_eczema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_eczema IN ('yes', 'no', '')),
    eczema_details TEXT NOT NULL DEFAULT '',
    has_psoriasis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_psoriasis IN ('yes', 'no', '')),
    psoriasis_details TEXT NOT NULL DEFAULT '',
    has_acne VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_acne IN ('yes', 'no', '')),
    acne_details TEXT NOT NULL DEFAULT '',
    has_skin_cancer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_skin_cancer_history IN ('yes', 'no', '')),
    skin_cancer_details TEXT NOT NULL DEFAULT '',
    has_autoimmune_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_condition IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    has_thyroid_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_thyroid_disease IN ('yes', 'no', '')),
    has_immunosuppression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_immunosuppression IN ('yes', 'no', '')),
    immunosuppression_details TEXT NOT NULL DEFAULT '',
    previous_skin_biopsies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_skin_biopsies IN ('yes', 'no', '')),
    biopsy_details TEXT NOT NULL DEFAULT '',
    previous_dermatological_procedures TEXT NOT NULL DEFAULT '',
    other_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Step 5 Medical History: past and current conditions relevant to dermatological care. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_eczema IS
    'Whether the patient has a history of eczema or atopic dermatitis.';
COMMENT ON COLUMN assessment_medical_history.eczema_details IS
    'Details of eczema history including severity and treatment.';
COMMENT ON COLUMN assessment_medical_history.has_psoriasis IS
    'Whether the patient has a history of psoriasis.';
COMMENT ON COLUMN assessment_medical_history.psoriasis_details IS
    'Details of psoriasis history including type and extent.';
COMMENT ON COLUMN assessment_medical_history.has_acne IS
    'Whether the patient has a history of acne.';
COMMENT ON COLUMN assessment_medical_history.acne_details IS
    'Details of acne history including severity and isotretinoin use.';
COMMENT ON COLUMN assessment_medical_history.has_skin_cancer_history IS
    'Whether the patient has a history of skin cancer (BCC, SCC, melanoma).';
COMMENT ON COLUMN assessment_medical_history.skin_cancer_details IS
    'Details of skin cancer history including type, site, and treatment.';
COMMENT ON COLUMN assessment_medical_history.has_autoimmune_condition IS
    'Whether the patient has an autoimmune condition.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_details IS
    'Details of autoimmune conditions (e.g. lupus, scleroderma).';
COMMENT ON COLUMN assessment_medical_history.has_diabetes IS
    'Whether the patient has diabetes (relevant to wound healing and skin infections).';
COMMENT ON COLUMN assessment_medical_history.has_thyroid_disease IS
    'Whether the patient has thyroid disease (associated with skin changes).';
COMMENT ON COLUMN assessment_medical_history.has_immunosuppression IS
    'Whether the patient is immunosuppressed (increased skin cancer risk).';
COMMENT ON COLUMN assessment_medical_history.immunosuppression_details IS
    'Details of immunosuppressive condition or therapy.';
COMMENT ON COLUMN assessment_medical_history.previous_skin_biopsies IS
    'Whether the patient has had previous skin biopsies.';
COMMENT ON COLUMN assessment_medical_history.biopsy_details IS
    'Details of previous skin biopsy results.';
COMMENT ON COLUMN assessment_medical_history.previous_dermatological_procedures IS
    'Previous dermatological procedures (e.g. cryotherapy, excision, phototherapy).';
COMMENT ON COLUMN assessment_medical_history.other_conditions IS
    'Free-text description of other relevant medical conditions.';

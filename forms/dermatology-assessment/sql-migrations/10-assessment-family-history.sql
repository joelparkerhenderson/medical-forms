-- 10_assessment_family_history.sql
-- Step 8: Family history section of the dermatology assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_eczema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_eczema IN ('yes', 'no', '')),
    family_eczema_relationship VARCHAR(50) NOT NULL DEFAULT '',
    family_psoriasis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_psoriasis IN ('yes', 'no', '')),
    family_psoriasis_relationship VARCHAR(50) NOT NULL DEFAULT '',
    family_skin_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_skin_cancer IN ('yes', 'no', '')),
    family_skin_cancer_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (family_skin_cancer_type IN ('melanoma', 'bcc', 'scc', 'other', '')),
    family_skin_cancer_relationship VARCHAR(50) NOT NULL DEFAULT '',
    family_autoimmune VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_autoimmune IN ('yes', 'no', '')),
    family_autoimmune_details TEXT NOT NULL DEFAULT '',
    family_atopy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_atopy IN ('yes', 'no', '')),
    family_atopy_details TEXT NOT NULL DEFAULT '',
    family_alopecia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_alopecia IN ('yes', 'no', '')),
    family_vitiligo VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_vitiligo IN ('yes', 'no', '')),
    other_family_skin_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Step 8 Family History: hereditary and familial dermatological conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_eczema IS
    'Whether there is a family history of eczema or atopic dermatitis.';
COMMENT ON COLUMN assessment_family_history.family_eczema_relationship IS
    'Relationship of the family member with eczema (e.g. parent, sibling).';
COMMENT ON COLUMN assessment_family_history.family_psoriasis IS
    'Whether there is a family history of psoriasis.';
COMMENT ON COLUMN assessment_family_history.family_psoriasis_relationship IS
    'Relationship of the family member with psoriasis.';
COMMENT ON COLUMN assessment_family_history.family_skin_cancer IS
    'Whether there is a family history of skin cancer.';
COMMENT ON COLUMN assessment_family_history.family_skin_cancer_type IS
    'Type of skin cancer in the family: melanoma, BCC, SCC, or other.';
COMMENT ON COLUMN assessment_family_history.family_skin_cancer_relationship IS
    'Relationship of the family member with skin cancer.';
COMMENT ON COLUMN assessment_family_history.family_autoimmune IS
    'Whether there is a family history of autoimmune disease.';
COMMENT ON COLUMN assessment_family_history.family_autoimmune_details IS
    'Details of family autoimmune conditions.';
COMMENT ON COLUMN assessment_family_history.family_atopy IS
    'Whether there is a family history of atopy (asthma, hay fever, eczema triad).';
COMMENT ON COLUMN assessment_family_history.family_atopy_details IS
    'Details of family atopic conditions.';
COMMENT ON COLUMN assessment_family_history.family_alopecia IS
    'Whether there is a family history of alopecia.';
COMMENT ON COLUMN assessment_family_history.family_vitiligo IS
    'Whether there is a family history of vitiligo.';
COMMENT ON COLUMN assessment_family_history.other_family_skin_conditions IS
    'Free-text description of other relevant family skin conditions.';

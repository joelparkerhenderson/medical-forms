-- 10_assessment_collection_method.sql
-- Collection method assessment section of the bone marrow donation assessment.

CREATE TABLE assessment_collection_method (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_method VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_method IN ('pbsc', 'bone-marrow', 'either', '')),
    recipient_preference VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (recipient_preference IN ('pbsc', 'bone-marrow', 'either', '')),
    final_collection_method VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (final_collection_method IN ('pbsc', 'bone-marrow', '')),
    gcsf_eligible VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gcsf_eligible IN ('yes', 'no', '')),
    gcsf_contraindications TEXT NOT NULL DEFAULT '',
    venous_access_suitable_for_apheresis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (venous_access_suitable_for_apheresis IN ('yes', 'no', '')),
    central_line_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (central_line_required IN ('yes', 'no', '')),
    estimated_donor_weight_kg NUMERIC(5,1),
    target_cd34_dose NUMERIC(6,2),
    estimated_collection_days INTEGER
        CHECK (estimated_collection_days IS NULL OR (estimated_collection_days >= 1 AND estimated_collection_days <= 5)),
    bone_marrow_harvest_volume_ml INTEGER
        CHECK (bone_marrow_harvest_volume_ml IS NULL OR bone_marrow_harvest_volume_ml >= 0),
    autologous_blood_donation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (autologous_blood_donation IN ('yes', 'no', '')),
    collection_method_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_collection_method_updated_at
    BEFORE UPDATE ON assessment_collection_method
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_collection_method IS
    'Collection method assessment section: PBSC vs bone marrow harvest, G-CSF eligibility, venous access, target doses. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_collection_method.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_collection_method.preferred_method IS
    'Donor preferred collection method: pbsc, bone-marrow, either, or empty.';
COMMENT ON COLUMN assessment_collection_method.recipient_preference IS
    'Recipient team preferred collection method: pbsc, bone-marrow, either, or empty.';
COMMENT ON COLUMN assessment_collection_method.final_collection_method IS
    'Final agreed collection method: pbsc or bone-marrow, or empty.';
COMMENT ON COLUMN assessment_collection_method.gcsf_eligible IS
    'Whether donor is eligible for G-CSF mobilisation: yes, no, or empty.';
COMMENT ON COLUMN assessment_collection_method.gcsf_contraindications IS
    'G-CSF contraindications if applicable.';
COMMENT ON COLUMN assessment_collection_method.venous_access_suitable_for_apheresis IS
    'Whether peripheral venous access is suitable for apheresis: yes, no, or empty.';
COMMENT ON COLUMN assessment_collection_method.central_line_required IS
    'Whether a central line is required for collection: yes, no, or empty.';
COMMENT ON COLUMN assessment_collection_method.estimated_donor_weight_kg IS
    'Estimated donor weight in kg for dose calculation.';
COMMENT ON COLUMN assessment_collection_method.target_cd34_dose IS
    'Target CD34+ cell dose in x10^6/kg recipient weight.';
COMMENT ON COLUMN assessment_collection_method.estimated_collection_days IS
    'Estimated number of apheresis collection days.';
COMMENT ON COLUMN assessment_collection_method.bone_marrow_harvest_volume_ml IS
    'Estimated bone marrow harvest volume in millilitres.';
COMMENT ON COLUMN assessment_collection_method.autologous_blood_donation IS
    'Whether autologous blood donation is planned pre-harvest: yes, no, or empty.';
COMMENT ON COLUMN assessment_collection_method.collection_method_notes IS
    'Additional clinician notes on collection method assessment.';

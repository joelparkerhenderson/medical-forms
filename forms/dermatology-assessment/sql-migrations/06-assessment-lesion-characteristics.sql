-- 06_assessment_lesion_characteristics.sql
-- Step 4: Lesion characteristics section of the dermatology assessment.

CREATE TABLE assessment_lesion_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    lesion_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (lesion_type IN ('macule', 'papule', 'patch', 'plaque', 'nodule', 'vesicle', 'bulla', 'pustule', 'wheal', 'erosion', 'ulcer', 'other', '')),
    lesion_type_other TEXT NOT NULL DEFAULT '',
    lesion_colour VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (lesion_colour IN ('erythematous', 'hyperpigmented', 'hypopigmented', 'violaceous', 'yellowish', 'skin_coloured', 'other', '')),
    lesion_shape VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (lesion_shape IN ('round', 'oval', 'annular', 'linear', 'serpiginous', 'irregular', '')),
    lesion_border VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lesion_border IN ('well_defined', 'ill_defined', 'raised', 'rolled', '')),
    lesion_surface VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lesion_surface IN ('smooth', 'rough', 'scaly', 'crusted', 'verrucous', 'ulcerated', '')),
    lesion_distribution VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (lesion_distribution IN ('localised', 'generalised', 'symmetrical', 'asymmetrical', 'dermatomal', 'sun_exposed', '')),
    lesion_size_mm NUMERIC(6,1)
        CHECK (lesion_size_mm IS NULL OR lesion_size_mm >= 0),
    number_of_lesions VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (number_of_lesions IN ('single', 'few_2_5', 'multiple_6_20', 'numerous_20_plus', '')),
    body_site TEXT NOT NULL DEFAULT '',
    dermoscopy_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dermoscopy_performed IN ('yes', 'no', '')),
    dermoscopy_findings TEXT NOT NULL DEFAULT '',
    photography_taken VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (photography_taken IN ('yes', 'no', '')),
    clinical_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lesion_characteristics_updated_at
    BEFORE UPDATE ON assessment_lesion_characteristics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lesion_characteristics IS
    'Step 4 Lesion Characteristics: morphological description of skin lesions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lesion_characteristics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_type IS
    'Primary morphology of the lesion.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_type_other IS
    'Description if lesion type is other.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_colour IS
    'Colour of the lesion.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_shape IS
    'Shape of the lesion.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_border IS
    'Border characteristics of the lesion.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_surface IS
    'Surface characteristics of the lesion.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_distribution IS
    'Distribution pattern of lesions on the body.';
COMMENT ON COLUMN assessment_lesion_characteristics.lesion_size_mm IS
    'Largest dimension of the lesion in millimetres.';
COMMENT ON COLUMN assessment_lesion_characteristics.number_of_lesions IS
    'Approximate number of lesions present.';
COMMENT ON COLUMN assessment_lesion_characteristics.body_site IS
    'Anatomical sites affected by lesions.';
COMMENT ON COLUMN assessment_lesion_characteristics.dermoscopy_performed IS
    'Whether dermoscopy examination was performed.';
COMMENT ON COLUMN assessment_lesion_characteristics.dermoscopy_findings IS
    'Dermoscopic findings if examination was performed.';
COMMENT ON COLUMN assessment_lesion_characteristics.photography_taken IS
    'Whether clinical photography was taken.';
COMMENT ON COLUMN assessment_lesion_characteristics.clinical_notes IS
    'Additional clinical observations about the lesions.';

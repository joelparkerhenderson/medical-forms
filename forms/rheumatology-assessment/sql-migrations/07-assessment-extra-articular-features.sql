-- 07_assessment_extra_articular_features.sql
-- Extra-articular features section of the rheumatology assessment.

CREATE TABLE assessment_extra_articular_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    rheumatoid_nodules VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rheumatoid_nodules IN ('yes', 'no', '')),
    rheumatoid_nodules_location TEXT NOT NULL DEFAULT '',
    dry_eyes_or_mouth VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dry_eyes_or_mouth IN ('yes', 'no', '')),
    skin_rash VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (skin_rash IN ('yes', 'no', '')),
    skin_rash_details TEXT NOT NULL DEFAULT '',
    raynauds_phenomenon VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (raynauds_phenomenon IN ('yes', 'no', '')),
    interstitial_lung_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interstitial_lung_disease IN ('yes', 'no', '')),
    vasculitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vasculitis IN ('yes', 'no', '')),
    scleritis_episcleritis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (scleritis_episcleritis IN ('yes', 'no', '')),
    peripheral_neuropathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (peripheral_neuropathy IN ('yes', 'no', '')),
    pleuritis_pericarditis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pleuritis_pericarditis IN ('yes', 'no', '')),
    constitutional_symptoms TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_extra_articular_features_updated_at
    BEFORE UPDATE ON assessment_extra_articular_features
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_extra_articular_features IS
    'Extra-articular features section: systemic manifestations of rheumatic disease beyond joints. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_extra_articular_features.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_extra_articular_features.rheumatoid_nodules IS
    'Whether rheumatoid nodules are present.';
COMMENT ON COLUMN assessment_extra_articular_features.rheumatoid_nodules_location IS
    'Location of rheumatoid nodules if present.';
COMMENT ON COLUMN assessment_extra_articular_features.dry_eyes_or_mouth IS
    'Whether sicca symptoms (dry eyes or mouth) are present, suggesting secondary Sjogren syndrome.';
COMMENT ON COLUMN assessment_extra_articular_features.skin_rash IS
    'Whether skin rash is present.';
COMMENT ON COLUMN assessment_extra_articular_features.skin_rash_details IS
    'Description of skin rash if present.';
COMMENT ON COLUMN assessment_extra_articular_features.raynauds_phenomenon IS
    'Whether Raynaud phenomenon is present.';
COMMENT ON COLUMN assessment_extra_articular_features.interstitial_lung_disease IS
    'Whether interstitial lung disease is present or suspected.';
COMMENT ON COLUMN assessment_extra_articular_features.vasculitis IS
    'Whether vasculitis is present.';
COMMENT ON COLUMN assessment_extra_articular_features.scleritis_episcleritis IS
    'Whether scleritis or episcleritis is present.';
COMMENT ON COLUMN assessment_extra_articular_features.peripheral_neuropathy IS
    'Whether peripheral neuropathy is present.';
COMMENT ON COLUMN assessment_extra_articular_features.pleuritis_pericarditis IS
    'Whether pleuritis or pericarditis is present.';
COMMENT ON COLUMN assessment_extra_articular_features.constitutional_symptoms IS
    'Free-text description of constitutional symptoms (fever, weight loss, malaise).';

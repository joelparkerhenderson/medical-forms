-- 10_assessment_photography_documentation.sql
-- Photography and documentation section of the plastic surgery assessment.

CREATE TABLE assessment_photography_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    clinical_photos_taken VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clinical_photos_taken IN ('yes', 'no', '')),
    photo_consent_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (photo_consent_obtained IN ('yes', 'no', '')),
    number_of_photos INTEGER
        CHECK (number_of_photos IS NULL OR number_of_photos >= 0),
    photo_views_taken TEXT NOT NULL DEFAULT '',
    standardised_views VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (standardised_views IN ('yes', 'no', '')),
    measurements_recorded VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (measurements_recorded IN ('yes', 'no', '')),
    measurement_details TEXT NOT NULL DEFAULT '',
    diagrams_drawn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diagrams_drawn IN ('yes', 'no', '')),
    diagram_notes TEXT NOT NULL DEFAULT '',
    previous_imaging VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_imaging IN ('yes', 'no', '')),
    previous_imaging_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (previous_imaging_type IN ('ct', 'mri', 'ultrasound', 'x-ray', 'angiography', 'other', '')),
    previous_imaging_findings TEXT NOT NULL DEFAULT '',
    documentation_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_photography_documentation_updated_at
    BEFORE UPDATE ON assessment_photography_documentation
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_photography_documentation IS
    'Photography and documentation section: clinical photos, measurements, diagrams, imaging. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_photography_documentation.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_photography_documentation.clinical_photos_taken IS
    'Whether clinical photographs were taken: yes, no, or empty.';
COMMENT ON COLUMN assessment_photography_documentation.photo_consent_obtained IS
    'Whether consent for photography was obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_photography_documentation.number_of_photos IS
    'Number of clinical photographs taken.';
COMMENT ON COLUMN assessment_photography_documentation.standardised_views IS
    'Whether standardised photographic views were used: yes, no, or empty.';
COMMENT ON COLUMN assessment_photography_documentation.measurements_recorded IS
    'Whether physical measurements were recorded: yes, no, or empty.';
COMMENT ON COLUMN assessment_photography_documentation.previous_imaging IS
    'Whether previous imaging is available: yes, no, or empty.';
COMMENT ON COLUMN assessment_photography_documentation.previous_imaging_type IS
    'Type of previous imaging: ct, mri, ultrasound, x-ray, angiography, other, or empty.';

-- 07_assessment_wound_tissue.sql
-- Wound and tissue assessment section of the plastic surgery assessment.

CREATE TABLE assessment_wound_tissue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_open_wound VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_open_wound IN ('yes', 'no', '')),
    wound_classification VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wound_classification IN ('clean', 'clean-contaminated', 'contaminated', 'dirty', '')),
    wound_age VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wound_age IN ('acute', 'subacute', 'chronic', '')),
    wound_aetiology VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (wound_aetiology IN ('surgical', 'traumatic', 'burn', 'pressure', 'venous', 'arterial', 'diabetic', 'radiation', 'other', '')),
    wound_bed_tissue VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wound_bed_tissue IN ('granulation', 'slough', 'necrotic', 'epithelialising', 'mixed', '')),
    wound_exudate VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wound_exudate IN ('none', 'serous', 'sanguineous', 'purulent', '')),
    wound_infection_signs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wound_infection_signs IN ('yes', 'no', '')),
    wound_infection_details TEXT NOT NULL DEFAULT '',
    tissue_viability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tissue_viability IN ('viable', 'compromised', 'non-viable', '')),
    surrounding_skin VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (surrounding_skin IN ('healthy', 'erythematous', 'oedematous', 'macerated', 'indurated', '')),
    vascular_supply VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vascular_supply IN ('adequate', 'compromised', 'absent', '')),
    sensory_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sensory_status IN ('intact', 'reduced', 'absent', '')),
    previous_wound_treatments TEXT NOT NULL DEFAULT '',
    wound_tissue_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_wound_tissue_updated_at
    BEFORE UPDATE ON assessment_wound_tissue
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_wound_tissue IS
    'Wound and tissue assessment section: wound classification, bed tissue, exudate, infection, vascular supply. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_wound_tissue.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_wound_tissue.wound_classification IS
    'CDC wound classification: clean, clean-contaminated, contaminated, dirty, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.wound_bed_tissue IS
    'Wound bed tissue type: granulation, slough, necrotic, epithelialising, mixed, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.wound_exudate IS
    'Wound exudate type: none, serous, sanguineous, purulent, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.wound_infection_signs IS
    'Whether there are signs of wound infection: yes, no, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.tissue_viability IS
    'Tissue viability assessment: viable, compromised, non-viable, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.vascular_supply IS
    'Vascular supply to the affected area: adequate, compromised, absent, or empty.';
COMMENT ON COLUMN assessment_wound_tissue.sensory_status IS
    'Sensory status of the affected area: intact, reduced, absent, or empty.';

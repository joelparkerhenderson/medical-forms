-- 10_assessment_comorbidities.sql
-- Comorbidities section of the assessment.

CREATE TABLE assessment_comorbidities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    asthma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asthma IN ('yes', 'no', '')),
    asthma_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (asthma_severity IN ('mild', 'moderate', 'severe', '')),
    eczema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (eczema IN ('yes', 'no', '')),
    eczema_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (eczema_severity IN ('mild', 'moderate', 'severe', '')),
    rhinitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rhinitis IN ('yes', 'no', '')),
    rhinitis_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (rhinitis_severity IN ('mild', 'moderate', 'severe', '')),
    eosinophilic_oesophagitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (eosinophilic_oesophagitis IN ('yes', 'no', '')),
    mast_cell_disorders VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mast_cell_disorders IN ('yes', 'no', '')),
    mast_cell_details TEXT NOT NULL DEFAULT '',
    mental_health_impact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mental_health_impact IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbidities_updated_at
    BEFORE UPDATE ON assessment_comorbidities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbidities IS
    'Comorbidities section: asthma, eczema, rhinitis, eosinophilic oesophagitis, mast cell disorders, and mental health impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbidities.asthma_severity IS
    'Asthma severity level: mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.mast_cell_disorders IS
    'Whether the patient has a mast cell disorder (yes/no).';
COMMENT ON COLUMN assessment_comorbidities.mental_health_impact IS
    'Whether allergy has affected mental health (yes/no).';

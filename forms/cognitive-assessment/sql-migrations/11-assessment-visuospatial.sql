-- 11_assessment_visuospatial.sql
-- Visuospatial section of the cognitive assessment (MMSE item 28).

CREATE TABLE assessment_visuospatial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Copy intersecting pentagons (1 point)
    pentagon_copy_correct VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pentagon_copy_correct IN ('correct', 'incorrect', '')),
    visuospatial_score INTEGER
        CHECK (visuospatial_score IS NULL OR (visuospatial_score >= 0 AND visuospatial_score <= 1)),
    pentagon_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pentagon_quality IN ('good', 'fair', 'poor', 'unable', '')),
    tremor_observed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tremor_observed IN ('yes', 'no', '')),
    visuospatial_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_visuospatial_updated_at
    BEFORE UPDATE ON assessment_visuospatial
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_visuospatial IS
    'Visuospatial section (MMSE item 28): copy intersecting pentagons (1 point). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_visuospatial.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_visuospatial.pentagon_copy_correct IS
    'Whether the patient correctly copied the intersecting pentagons: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_visuospatial.visuospatial_score IS
    'Subtotal score for visuospatial, 0-1.';
COMMENT ON COLUMN assessment_visuospatial.pentagon_quality IS
    'Qualitative assessment of pentagon drawing quality: good, fair, poor, unable, or empty.';
COMMENT ON COLUMN assessment_visuospatial.tremor_observed IS
    'Whether tremor was observed during drawing: yes, no, or empty.';
COMMENT ON COLUMN assessment_visuospatial.visuospatial_notes IS
    'Additional clinician notes on visuospatial assessment.';

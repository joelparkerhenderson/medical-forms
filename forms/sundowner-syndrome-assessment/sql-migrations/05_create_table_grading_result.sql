CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cmai_score INTEGER
        CHECK (cmai_score IS NULL OR (cmai_score >= 29 AND cmai_score <= 203)),
    npi_total_score INTEGER
        CHECK (npi_total_score IS NULL OR (npi_total_score >= 0 AND npi_total_score <= 144)),
    overall_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_severity IN ('mild', 'moderate', 'severe', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed sundowner syndrome grading result. CMAI score 29-203 and NPI score 0-144 with overall severity classification. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.cmai_score IS
    'Cohen-Mansfield Agitation Inventory total score (29-203).';
COMMENT ON COLUMN grading_result.npi_total_score IS
    'Neuropsychiatric Inventory total score (0-144).';
COMMENT ON COLUMN grading_result.overall_severity IS
    'Overall sundowner severity: mild, moderate, severe, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';

-- Computed scoring and sign-off for an assessment.
-- Summary, ASA, and sign-off.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    pre_operative_assessment_by_clinician_id UUID NOT NULL UNIQUE
        REFERENCES pre_operative_assessment_by_clinician(id) ON DELETE CASCADE,

    computed_asa_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (computed_asa_grade IN ('I', 'II', 'III', 'IV', 'V', 'VI', '')),
    final_asa_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (final_asa_grade IN ('I', 'II', 'III', 'IV', 'V', 'VI', '')),
    asa_emergency_suffix VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asa_emergency_suffix IN ('E', '')),
    override_reason VARCHAR(500) NOT NULL DEFAULT '',

    mallampati_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mallampati_class IN ('I', 'II', 'III', 'IV', '')),
    rcri_score INTEGER
        CHECK (rcri_score IS NULL OR rcri_score BETWEEN 0 AND 6),
    stopbang_score INTEGER
        CHECK (stopbang_score IS NULL OR stopbang_score BETWEEN 0 AND 8),
    frailty_scale INTEGER
        CHECK (frailty_scale IS NULL OR frailty_scale BETWEEN 1 AND 9),

    composite_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (composite_risk IN ('low', 'moderate', 'high', 'critical', '')),

    recommendation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (recommendation IN ('proceed', 'optimise-first', 'mdt-review', 'cancel', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',
    signed_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Step 16: computed and signed-off grading result. Stores both the engine-computed ASA grade and the clinician-final grade with an override reason.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when the record was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when the record was updated.';
COMMENT ON COLUMN grading_result.computed_asa_grade IS
    'ASA grade computed by the engine from clinician-observed data.';
COMMENT ON COLUMN grading_result.final_asa_grade IS
    'ASA grade signed off by the clinician (may equal or differ from computed).';
COMMENT ON COLUMN grading_result.asa_emergency_suffix IS
    'Emergency suffix: E if the procedure is emergency, empty otherwise.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Reason the clinician set final differently from computed (mandatory when they differ).';
COMMENT ON COLUMN grading_result.mallampati_class IS
    'Mallampati airway class as per step 4.';
COMMENT ON COLUMN grading_result.rcri_score IS
    'Revised Cardiac Risk Index score (0-6).';
COMMENT ON COLUMN grading_result.stopbang_score IS
    'STOP-BANG score (0-8).';
COMMENT ON COLUMN grading_result.frailty_scale IS
    'Clinical Frailty Scale score (1-9).';
COMMENT ON COLUMN grading_result.composite_risk IS
    'Composite perioperative risk: low, moderate, high, critical.';
COMMENT ON COLUMN grading_result.recommendation IS
    'Overall recommendation: proceed, optimise-first, mdt-review, cancel.';
COMMENT ON COLUMN grading_result.clinician_notes IS
    'Free-text clinician summary notes.';
COMMENT ON COLUMN grading_result.signed_at IS
    'Timestamp of clinician electronic signature.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the engine last computed the result.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.pre_operative_assessment_by_clinician_id IS
    'Foreign key to the pre_operative_assessment_by_clinician table.';

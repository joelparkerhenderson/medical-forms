CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    total_symptom_score INTEGER NOT NULL DEFAULT 0
        CHECK (total_symptom_score >= 0),
    dermatological_score INTEGER NOT NULL DEFAULT 0
        CHECK (dermatological_score >= 0),
    gastrointestinal_score INTEGER NOT NULL DEFAULT 0
        CHECK (gastrointestinal_score >= 0),
    cardiovascular_score INTEGER NOT NULL DEFAULT 0
        CHECK (cardiovascular_score >= 0),
    respiratory_score INTEGER NOT NULL DEFAULT 0
        CHECK (respiratory_score >= 0),
    neurological_score INTEGER NOT NULL DEFAULT 0
        CHECK (neurological_score >= 0),
    organ_system_count INTEGER NOT NULL DEFAULT 0
        CHECK (organ_system_count >= 0 AND organ_system_count <= 5),
    severity_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('mild', 'moderate', 'severe', '')),
    trigger_count INTEGER NOT NULL DEFAULT 0
        CHECK (trigger_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed MCAS symptom grading result across multiple organ systems. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.total_symptom_score IS
    'Total cumulative symptom severity score across all organ systems.';
COMMENT ON COLUMN grading_result.dermatological_score IS
    'Symptom severity score for dermatological system.';
COMMENT ON COLUMN grading_result.gastrointestinal_score IS
    'Symptom severity score for gastrointestinal system.';
COMMENT ON COLUMN grading_result.cardiovascular_score IS
    'Symptom severity score for cardiovascular system.';
COMMENT ON COLUMN grading_result.respiratory_score IS
    'Symptom severity score for respiratory system.';
COMMENT ON COLUMN grading_result.neurological_score IS
    'Symptom severity score for neurological system.';
COMMENT ON COLUMN grading_result.organ_system_count IS
    'Number of organ systems affected (0-5).';
COMMENT ON COLUMN grading_result.severity_level IS
    'Overall severity classification: mild, moderate, or severe.';
COMMENT ON COLUMN grading_result.trigger_count IS
    'Number of identified symptom triggers.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';

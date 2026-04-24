CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    physical_fitness_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (physical_fitness_level IN ('not-competent', 'developing', 'competent', 'expert', '')),
    clinical_skills_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (clinical_skills_level IN ('not-competent', 'developing', 'competent', 'expert', '')),
    equipment_vehicle_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (equipment_vehicle_level IN ('not-competent', 'developing', 'competent', 'expert', '')),
    communication_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (communication_level IN ('not-competent', 'developing', 'competent', 'expert', '')),
    psychological_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (psychological_level IN ('not-competent', 'developing', 'competent', 'expert', '')),
    overall_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    overall_fitness VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (overall_fitness IN ('fit-for-duty', 'fit-with-restrictions', 'temporarily-unfit', 'permanently-unfit', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed first responder competency grading result. Domain competency levels and overall fitness decision. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.physical_fitness_level IS
    'Aggregated physical fitness competency level.';
COMMENT ON COLUMN grading_result.clinical_skills_level IS
    'Aggregated clinical skills competency level.';
COMMENT ON COLUMN grading_result.equipment_vehicle_level IS
    'Aggregated equipment and vehicle competency level.';
COMMENT ON COLUMN grading_result.communication_level IS
    'Aggregated communication competency level.';
COMMENT ON COLUMN grading_result.psychological_level IS
    'Aggregated psychological readiness competency level.';
COMMENT ON COLUMN grading_result.overall_competency IS
    'Overall competency across all domains.';
COMMENT ON COLUMN grading_result.overall_fitness IS
    'Overall fitness decision: fit-for-duty, fit-with-restrictions, temporarily-unfit, permanently-unfit, or empty.';
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

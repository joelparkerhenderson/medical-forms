CREATE TABLE validation_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    completeness_score SMALLINT NOT NULL DEFAULT 0
        CHECK (completeness_score >= 0 AND completeness_score <= 100),
    completeness_status VARCHAR(30) NOT NULL DEFAULT '',
    validation_status VARCHAR(30) NOT NULL DEFAULT '',
    validated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_validation_result_updated_at
    BEFORE UPDATE ON validation_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE validation_result IS
    'Validation result summarizing completeness and status of the release form. One-to-one child of release_form.';
COMMENT ON COLUMN validation_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN validation_result.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN validation_result.completeness_score IS
    'Percentage score (0-100) indicating form completeness.';
COMMENT ON COLUMN validation_result.completeness_status IS
    'Human-readable completeness status label.';
COMMENT ON COLUMN validation_result.validation_status IS
    'Overall validation status label.';
COMMENT ON COLUMN validation_result.validated_at IS
    'Timestamp when the validation was last performed.';

COMMENT ON COLUMN validation_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN validation_result.updated_at IS
    'Timestamp when this row was last updated.';

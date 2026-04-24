CREATE TABLE assessment_strength_testing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    grip_strength_affected_kg NUMERIC(5,1)
        CHECK (grip_strength_affected_kg IS NULL OR grip_strength_affected_kg >= 0),
    grip_strength_unaffected_kg NUMERIC(5,1)
        CHECK (grip_strength_unaffected_kg IS NULL OR grip_strength_unaffected_kg >= 0),
    overall_strength_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_strength_status IN ('normal', 'mildly-reduced', 'moderately-reduced', 'severely-reduced', '')),
    strength_testing_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_strength_testing_updated_at
    BEFORE UPDATE ON assessment_strength_testing
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_strength_testing IS
    'Strength testing section header: grip strength and overall status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_strength_testing.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_strength_testing.grip_strength_affected_kg IS
    'Grip strength of the affected side in kilograms.';
COMMENT ON COLUMN assessment_strength_testing.grip_strength_unaffected_kg IS
    'Grip strength of the unaffected side in kilograms.';
COMMENT ON COLUMN assessment_strength_testing.overall_strength_status IS
    'Overall strength assessment: normal, mildly-reduced, moderately-reduced, severely-reduced, or empty.';
COMMENT ON COLUMN assessment_strength_testing.strength_testing_notes IS
    'Additional notes on strength testing.';

COMMENT ON COLUMN assessment_strength_testing.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_strength_testing.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_strength_testing.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_strength_testing.deleted_at IS
    'Timestamp when this row was deleted.';
-- Individual muscle strength tests (one-to-many child)


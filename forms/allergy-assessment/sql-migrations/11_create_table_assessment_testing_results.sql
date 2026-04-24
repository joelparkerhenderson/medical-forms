CREATE TABLE assessment_testing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    skin_prick_tests_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (skin_prick_tests_done IN ('yes', 'no', '')),
    specific_ige_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (specific_ige_done IN ('yes', 'no', '')),
    component_resolved_diagnostics_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (component_resolved_diagnostics_done IN ('yes', 'no', '')),
    challenge_tests_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (challenge_tests_done IN ('yes', 'no', '')),
    patch_tests_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patch_tests_done IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_testing_results_updated_at
    BEFORE UPDATE ON assessment_testing_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_testing_results IS
    'Testing results section: which allergy tests have been performed. One-to-one child of assessment.';

-- Individual test result items (one-to-many child)

COMMENT ON COLUMN assessment_testing_results.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_testing_results.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_testing_results.skin_prick_tests_done IS
    'Skin prick tests done. One of: yes, no.';
COMMENT ON COLUMN assessment_testing_results.specific_ige_done IS
    'Specific ige done. One of: yes, no.';
COMMENT ON COLUMN assessment_testing_results.component_resolved_diagnostics_done IS
    'Component resolved diagnostics done. One of: yes, no.';
COMMENT ON COLUMN assessment_testing_results.challenge_tests_done IS
    'Challenge tests done. One of: yes, no.';
COMMENT ON COLUMN assessment_testing_results.patch_tests_done IS
    'Patch tests done. One of: yes, no.';
COMMENT ON COLUMN assessment_testing_results.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_testing_results.updated_at IS
    'Timestamp when this row was last updated.';

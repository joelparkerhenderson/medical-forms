CREATE TABLE assessment_test_result_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    testing_results_id UUID NOT NULL
        REFERENCES assessment_testing_results(id) ON DELETE CASCADE,

    test_type VARCHAR(255) NOT NULL DEFAULT '',
    allergen VARCHAR(255) NOT NULL DEFAULT '',
    result VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_test_result_item_updated_at
    BEFORE UPDATE ON assessment_test_result_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_test_result_item IS
    'Individual test result entry with test type, allergen tested, and result.';

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
COMMENT ON COLUMN assessment_test_result_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_test_result_item.testing_results_id IS
    'Foreign key to the assessment_testing_results table.';
COMMENT ON COLUMN assessment_test_result_item.test_type IS
    'Test type.';
COMMENT ON COLUMN assessment_test_result_item.allergen IS
    'Allergen.';
COMMENT ON COLUMN assessment_test_result_item.result IS
    'Result.';
COMMENT ON COLUMN assessment_test_result_item.sort_order IS
    'Sort order.';
COMMENT ON COLUMN assessment_test_result_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_test_result_item.updated_at IS
    'Timestamp when this row was last updated.';

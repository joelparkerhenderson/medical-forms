-- 08_assessment_testing_results.sql
-- Testing results section: header row and individual test result items.

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

CREATE TRIGGER trg_assessment_testing_results_updated_at
    BEFORE UPDATE ON assessment_testing_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_testing_results IS
    'Testing results section: which allergy tests have been performed. One-to-one child of assessment.';

-- Individual test result items (one-to-many child)
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

CREATE TRIGGER trg_assessment_test_result_item_updated_at
    BEFORE UPDATE ON assessment_test_result_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_test_result_item IS
    'Individual test result entry with test type, allergen tested, and result.';

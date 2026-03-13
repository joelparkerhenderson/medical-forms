-- 15_grading_additional_flag.sql
-- Additional flags detected during patient intake assessment grading.

CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(30) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Additional flags detected during patient intake grading, such as missing critical information, allergy alerts, or safeguarding concerns.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Identifier of the flag (e.g. FLAG-ALLERGY-001, FLAG-SAFEGUARD-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Category of the flag (e.g. Allergy, Medication, Social, Safeguarding).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable description of the flagged issue.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Priority level: high, medium, or low.';

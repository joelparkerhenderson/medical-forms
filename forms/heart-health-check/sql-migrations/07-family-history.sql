-- 07_family_history.sql
-- Cardiovascular and diabetes family history.

CREATE TABLE family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_cvd_under_60 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_cvd_under_60 IN ('yes', 'no', '')),
    family_cvd_relationship VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (family_cvd_relationship IN ('parent', 'sibling', 'child', 'multiple', '')),
    family_diabetes_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_diabetes_history IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_family_history_updated_at
    BEFORE UPDATE ON family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE family_history IS
    'Family history of cardiovascular disease and diabetes.';
COMMENT ON COLUMN family_history.family_cvd_under_60 IS
    'Whether a first-degree relative had CVD under age 60.';
COMMENT ON COLUMN family_history.family_cvd_relationship IS
    'Relationship of the affected relative.';
COMMENT ON COLUMN family_history.family_diabetes_history IS
    'Whether there is a family history of diabetes.';

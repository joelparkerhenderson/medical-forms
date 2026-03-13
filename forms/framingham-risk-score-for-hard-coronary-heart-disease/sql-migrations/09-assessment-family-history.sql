-- 09_assessment_family_history.sql
-- Step 7: Family history section of the Framingham Risk Score assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_chd_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_chd_history IN ('yes', 'no', '')),
    family_chd_age_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (family_chd_age_onset IN ('under55', '55_to_65', 'over65', '')),
    family_chd_relationship VARCHAR(50) NOT NULL DEFAULT '',
    family_stroke_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_stroke_history IN ('yes', 'no', '')),
    family_diabetes_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_diabetes_history IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Step 7 Family History: family cardiovascular disease history. Premature family CHD (onset under 55) is an additional risk factor. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_chd_history IS
    'Whether there is a family history of coronary heart disease.';
COMMENT ON COLUMN assessment_family_history.family_chd_age_onset IS
    'Age of onset of CHD in family member: under55 (premature), 55_to_65, over65.';
COMMENT ON COLUMN assessment_family_history.family_chd_relationship IS
    'Relationship of the family member with CHD (e.g. father, mother, sibling).';
COMMENT ON COLUMN assessment_family_history.family_stroke_history IS
    'Whether there is a family history of stroke.';
COMMENT ON COLUMN assessment_family_history.family_diabetes_history IS
    'Whether there is a family history of diabetes.';

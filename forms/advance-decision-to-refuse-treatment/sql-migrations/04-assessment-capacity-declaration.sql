-- 04_assessment_capacity_declaration.sql
-- Capacity declaration section of the advance decision to refuse treatment.

CREATE TABLE assessment_capacity_declaration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_mental_capacity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_mental_capacity IN ('yes', 'no', '')),
    understands_consequences VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_consequences IN ('yes', 'no', '')),
    made_voluntarily VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (made_voluntarily IN ('yes', 'no', '')),
    capacity_assessment_date DATE,
    capacity_assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    capacity_assessor_role VARCHAR(100) NOT NULL DEFAULT '',
    capacity_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_capacity_declaration_updated_at
    BEFORE UPDATE ON assessment_capacity_declaration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_capacity_declaration IS
    'Capacity declaration section: confirms the person has mental capacity to make this advance decision per Mental Capacity Act 2005. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_capacity_declaration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_capacity_declaration.has_mental_capacity IS
    'Whether the person currently has mental capacity to make this decision.';
COMMENT ON COLUMN assessment_capacity_declaration.understands_consequences IS
    'Whether the person understands the consequences of refusing treatment, including risk of death.';
COMMENT ON COLUMN assessment_capacity_declaration.made_voluntarily IS
    'Whether the decision was made voluntarily, without undue influence or coercion.';
COMMENT ON COLUMN assessment_capacity_declaration.capacity_assessment_date IS
    'Date when capacity was assessed, NULL if unanswered.';
COMMENT ON COLUMN assessment_capacity_declaration.capacity_assessor_name IS
    'Name of the professional who assessed capacity.';
COMMENT ON COLUMN assessment_capacity_declaration.capacity_assessor_role IS
    'Professional role of the capacity assessor.';
COMMENT ON COLUMN assessment_capacity_declaration.capacity_notes IS
    'Free-text notes about the capacity assessment.';

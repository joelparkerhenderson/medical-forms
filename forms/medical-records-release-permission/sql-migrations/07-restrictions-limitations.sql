-- 07_restrictions_limitations.sql
-- Patient-specified exclusions for sensitive record categories.

CREATE TABLE restrictions_limitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    exclude_hiv VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exclude_hiv IN ('yes', 'no', '')),
    exclude_substance_abuse VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exclude_substance_abuse IN ('yes', 'no', '')),
    exclude_mental_health VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exclude_mental_health IN ('yes', 'no', '')),
    exclude_genetic_info VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exclude_genetic_info IN ('yes', 'no', '')),
    exclude_sti VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exclude_sti IN ('yes', 'no', '')),
    additional_restrictions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_restrictions_limitations_updated_at
    BEFORE UPDATE ON restrictions_limitations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE restrictions_limitations IS
    'Patient restrictions on which sensitive record categories to exclude from release. One-to-one child of release_form.';
COMMENT ON COLUMN restrictions_limitations.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN restrictions_limitations.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN restrictions_limitations.exclude_hiv IS
    'Exclude HIV/AIDS-related records: yes, no, or empty string.';
COMMENT ON COLUMN restrictions_limitations.exclude_substance_abuse IS
    'Exclude substance abuse records: yes, no, or empty string.';
COMMENT ON COLUMN restrictions_limitations.exclude_mental_health IS
    'Exclude mental health records: yes, no, or empty string.';
COMMENT ON COLUMN restrictions_limitations.exclude_genetic_info IS
    'Exclude genetic information records: yes, no, or empty string.';
COMMENT ON COLUMN restrictions_limitations.exclude_sti IS
    'Exclude sexually transmitted infection records: yes, no, or empty string.';
COMMENT ON COLUMN restrictions_limitations.additional_restrictions IS
    'Free-text additional restrictions specified by the patient.';

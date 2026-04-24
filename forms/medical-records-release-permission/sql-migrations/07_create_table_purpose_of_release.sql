CREATE TABLE purpose_of_release (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    purpose VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (purpose IN (
            'continuing-care',
            'second-opinion',
            'insurance',
            'legal',
            'personal',
            'research',
            'employment',
            'other',
            ''
        )),
    other_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (purpose != 'other' OR other_details IS NOT NULL)
);

CREATE TRIGGER trigger_purpose_of_release_updated_at
    BEFORE UPDATE ON purpose_of_release
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE purpose_of_release IS
    'Stated purpose for the medical records release. One-to-one child of release_form.';
COMMENT ON COLUMN purpose_of_release.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN purpose_of_release.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN purpose_of_release.purpose IS
    'Release purpose: continuing-care, second-opinion, insurance, legal, personal, research, employment, other, or empty string.';
COMMENT ON COLUMN purpose_of_release.other_details IS
    'Free-text details required when purpose is other. Must not be NULL when purpose is other.';

COMMENT ON COLUMN purpose_of_release.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN purpose_of_release.updated_at IS
    'Timestamp when this row was last updated.';

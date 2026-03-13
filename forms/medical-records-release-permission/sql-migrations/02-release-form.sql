-- 02_release_form.sql
-- Top-level release form linking a patient to a records-release request.

CREATE TABLE release_form (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patient(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'approved', 'expired', 'revoked')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_release_form_updated_at
    BEFORE UPDATE ON release_form
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE release_form IS
    'Medical records release permission form. Parent entity for all form sections.';
COMMENT ON COLUMN release_form.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN release_form.patient_id IS
    'Foreign key to the patient who owns this release form.';
COMMENT ON COLUMN release_form.status IS
    'Lifecycle status: draft, submitted, approved, expired, or revoked.';

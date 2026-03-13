-- 06_authorization_period.sql
-- Time window during which the release authorization is valid.

CREATE TABLE authorization_period (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    single_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (single_use IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (end_date >= start_date)
);

CREATE TRIGGER trg_authorization_period_updated_at
    BEFORE UPDATE ON authorization_period
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE authorization_period IS
    'Authorization validity period for the records release. One-to-one child of release_form.';
COMMENT ON COLUMN authorization_period.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN authorization_period.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN authorization_period.start_date IS
    'Date from which the authorization is valid.';
COMMENT ON COLUMN authorization_period.end_date IS
    'Date until which the authorization is valid. Must be >= start_date.';
COMMENT ON COLUMN authorization_period.single_use IS
    'Whether the authorization is for a single use only: yes, no, or empty string.';

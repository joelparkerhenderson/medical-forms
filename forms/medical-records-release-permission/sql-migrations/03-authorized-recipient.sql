-- 03_authorized_recipient.sql
-- The person or organization authorized to receive the released records.

CREATE TABLE authorized_recipient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    recipient_name VARCHAR(255) NOT NULL DEFAULT '',
    recipient_organization VARCHAR(255) NOT NULL DEFAULT '',
    recipient_address TEXT NOT NULL DEFAULT '',
    recipient_phone VARCHAR(30) NOT NULL DEFAULT '',
    recipient_email VARCHAR(255) NOT NULL DEFAULT '',
    recipient_role VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_authorized_recipient_updated_at
    BEFORE UPDATE ON authorized_recipient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE authorized_recipient IS
    'Authorized recipient of released medical records. One-to-one child of release_form.';
COMMENT ON COLUMN authorized_recipient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN authorized_recipient.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN authorized_recipient.recipient_name IS
    'Full name of the authorized recipient.';
COMMENT ON COLUMN authorized_recipient.recipient_organization IS
    'Organization the recipient belongs to.';
COMMENT ON COLUMN authorized_recipient.recipient_role IS
    'Professional role or title of the recipient.';
